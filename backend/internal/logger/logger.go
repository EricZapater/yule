package logger

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/http"
	"runtime/debug"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// LogEntry representa un registre estructurat d'una petició HTTP o event del sistema.
type LogEntry struct {
	ID           string    `json:"id"`
	Timestamp    time.Time `json:"timestamp"`
	Level        string    `json:"level"` // INFO, WARN, ERROR, PANIC
	Status       int       `json:"status"`
	Method       string    `json:"method"`
	Path         string    `json:"path"`
	LatencyMs    float64   `json:"latency_ms"`
	ClientIP     string    `json:"client_ip"`
	UserID       string    `json:"user_id,omitempty"`
	RequestID    string    `json:"request_id"`
	ErrorCode    string    `json:"error_code,omitempty"`
	ErrorMessage string    `json:"error_message,omitempty"`
	RequestBody  string    `json:"request_body,omitempty"`
}

const (
	maxRingBufferSize = 250
	maxBodyLogSize    = 4096
	ContextRequestID  = "requestID"
)

type LogBuffer struct {
	mu      sync.RWMutex
	entries []LogEntry
}

var globalBuffer = &LogBuffer{
	entries: make([]LogEntry, 0, maxRingBufferSize),
}

func (b *LogBuffer) Add(entry LogEntry) {
	b.mu.Lock()
	defer b.mu.Unlock()

	if len(b.entries) >= maxRingBufferSize {
		b.entries = b.entries[1:]
	}
	b.entries = append(b.entries, entry)
}

func (b *LogBuffer) GetRecent(limit int) []LogEntry {
	b.mu.RLock()
	defer b.mu.RUnlock()

	total := len(b.entries)
	if limit <= 0 || limit > total {
		limit = total
	}

	result := make([]LogEntry, limit)
	for i := 0; i < limit; i++ {
		// Retornar en ordre cronològic invers (més recents primer)
		result[i] = b.entries[total-1-i]
	}
	return result
}

// GetRecentLogs retorna els darrers logs en memòria per a consulta de diagnòstic.
func GetRecentLogs(limit int) []LogEntry {
	return globalBuffer.GetRecent(limit)
}

// Middleware crea el middleware de logging estructurat per a Gin.
func Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		// 1. Assignar o recuperar Request ID
		reqID := c.GetHeader("X-Request-ID")
		if reqID == "" {
			reqID = "req_" + uuid.New().String()[:8]
		}
		c.Set(ContextRequestID, reqID)
		c.Writer.Header().Set("X-Request-ID", reqID)

		// 2. Llegir el Request Body per a mètodes amb càrrega útil
		var reqBody string
		if c.Request.Method == http.MethodPost || c.Request.Method == http.MethodPut || c.Request.Method == http.MethodPatch || c.Request.Method == http.MethodDelete {
			if c.Request.Body != nil {
				bodyBytes, err := io.ReadAll(io.LimitReader(c.Request.Body, maxBodyLogSize))
				if err == nil {
					reqBody = string(bodyBytes)
					// Restaurar el body perquè els handlers següents el puguin llegir
					c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
				}
			}
		}

		// 3. Executar la petició
		c.Next()

		// 4. Calcular latència i extreure informació
		latency := time.Since(start)
		latencyMs := float64(latency.Microseconds()) / 1000.0
		status := c.Writer.Status()
		path := c.Request.URL.Path
		rawQuery := c.Request.URL.RawQuery
		if rawQuery != "" {
			path += "?" + rawQuery
		}

		// Silenciar el healthcheck periòdic a nivell d'informació si no hi ha error
		if path == "/health" || path == "/api/v1/health" {
			if status < 400 {
				return
			}
		}

		clientIP := c.ClientIP()
		userID := c.GetString("userID")
		errorCode := c.GetString("errorCode")
		errorMsg := c.GetString("errorMessage")

		// Si hi ha errors recollits a Gin c.Errors
		if errorMsg == "" && len(c.Errors) > 0 {
			errorMsg = c.Errors.String()
		}

		level := "INFO"
		if status >= 500 {
			level = "ERROR"
		} else if status >= 400 {
			level = "WARN"
		}

		entry := LogEntry{
			ID:           uuid.New().String(),
			Timestamp:    time.Now(),
			Level:        level,
			Status:       status,
			Method:       c.Request.Method,
			Path:         path,
			LatencyMs:    latencyMs,
			ClientIP:     clientIP,
			UserID:       userID,
			RequestID:    reqID,
			ErrorCode:    errorCode,
			ErrorMessage: errorMsg,
			RequestBody:  reqBody,
		}

		globalBuffer.Add(entry)

		// 5. Output formatat a consola
		formatConsoleLog(entry)
	}
}

// Recovery crea el middleware de captura de panics amb formatació d'errors.
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if r := recover(); r != nil {
				stack := string(debug.Stack())
				reqID := c.GetString(ContextRequestID)
				if reqID == "" {
					reqID = "panic_" + uuid.New().String()[:8]
				}

				entry := LogEntry{
					ID:           uuid.New().String(),
					Timestamp:    time.Now(),
					Level:        "PANIC",
					Status:       http.StatusInternalServerError,
					Method:       c.Request.Method,
					Path:         c.Request.URL.Path,
					ClientIP:     c.ClientIP(),
					UserID:       c.GetString("userID"),
					RequestID:    reqID,
					ErrorCode:    "INTERNAL_PANIC",
					ErrorMessage: fmt.Sprintf("%v\nStack trace:\n%s", r, stack),
				}
				globalBuffer.Add(entry)

				log.Printf("💥 [PANIC RECOVERED] [%s] %s %s: %v\n%s", reqID, c.Request.Method, c.Request.URL.Path, r, stack)

				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"error":      "Error intern inesperat del servidor",
					"code":       "INTERNAL_PANIC",
					"request_id": reqID,
				})
			}
		}()
		c.Next()
	}
}

func formatConsoleLog(e LogEntry) {
	var icon string
	switch e.Level {
	case "ERROR", "PANIC":
		icon = "🔴"
	case "WARN":
		icon = "🟡"
	default:
		icon = "🟢"
	}

	userTag := ""
	if e.UserID != "" {
		userTag = fmt.Sprintf(" | user:%s", e.UserID)
	}

	if e.Level == "ERROR" || e.Level == "PANIC" {
		log.Printf("%s [%s %d] %s %s (%.2fms) | IP: %s%s | ReqID: %s\n    ❌ Error: [%s] %s\n    📦 Payload: %s",
			icon, e.Level, e.Status, e.Method, e.Path, e.LatencyMs, e.ClientIP, userTag, e.RequestID,
			e.ErrorCode, e.ErrorMessage, sanitizeBody(e.RequestBody),
		)
	} else if e.Level == "WARN" {
		log.Printf("%s [%s %d] %s %s (%.2fms) | IP: %s%s | ReqID: %s | %s: %s",
			icon, e.Level, e.Status, e.Method, e.Path, e.LatencyMs, e.ClientIP, userTag, e.RequestID,
			e.ErrorCode, e.ErrorMessage,
		)
	} else {
		log.Printf("%s [%d] %s %s (%.2fms) | IP: %s%s | ReqID: %s",
			icon, e.Status, e.Method, e.Path, e.LatencyMs, e.ClientIP, userTag, e.RequestID,
		)
	}
}

func sanitizeBody(body string) string {
	if body == "" {
		return "(buit)"
	}
	body = strings.TrimSpace(body)
	if len(body) > 500 {
		return body[:500] + "... [truncat]"
	}
	return body
}
