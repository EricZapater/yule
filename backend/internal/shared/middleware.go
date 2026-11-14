package shared

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	ContextUserID   = "userID"
	ContextEmail    = "email"
	ContextUserRole = "userRole"
)

// AuthMiddleware comprova el JWT a la capçalera Authorization Bearer.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Capçalera Authorization requerida")
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Format de token invàlid (Bearer requerit)")
			c.Abort()
			return
		}

		claims, err := ValidateJWT(parts[1])
		if err != nil {
			RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Sessió invàlida o caducada")
			c.Abort()
			return
		}

		c.Set(ContextUserID, claims.UserID)
		c.Set(ContextEmail, claims.Email)
		c.Set(ContextUserRole, claims.Role)
		c.Next()
	}
}

// RequireAdmin comprova que l'usuari tingui rol 'admin'.
func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get(ContextUserRole)
		if !exists || role != "admin" {
			RespondError(c, http.StatusForbidden, "FORBIDDEN", "Accés restringit exclusivament a l'administrador")
			c.Abort()
			return
		}
		c.Next()
	}
}

// CORSMiddleware afegeix suport per a crides des del client web i mòbil.
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		}
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
