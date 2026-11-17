package shared

import (
	"github.com/gin-gonic/gin"
)

// ErrorResponse representa l'estructura d'error segons el contracte OpenAPI.
type ErrorResponse struct {
	Error     string `json:"error"`
	Code      string `json:"code"`
	RequestID string `json:"request_id,omitempty"`
}

// RespondError envia una resposta d'error normalitzada i registra el diagnòstic al context.
func RespondError(c *gin.Context, statusCode int, code, message string) {
	c.Set("errorCode", code)
	c.Set("errorMessage", message)
	_ = c.Error(gin.Error{
		Err:  nil,
		Type: gin.ErrorTypePrivate,
		Meta: message,
	})

	reqID := c.GetString("requestID")
	if reqID == "" {
		reqID = c.GetHeader("X-Request-ID")
	}

	c.JSON(statusCode, ErrorResponse{
		Error:     message,
		Code:      code,
		RequestID: reqID,
	})
}

// MessageResponse representa missatges d'èxit senzills.
type MessageResponse struct {
	Message string `json:"message"`
}

// RespondMessage envia un missatge de text de conformitat.
func RespondMessage(c *gin.Context, statusCode int, message string) {
	c.JSON(statusCode, MessageResponse{
		Message: message,
	})
}
