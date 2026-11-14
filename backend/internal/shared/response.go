package shared

import (
	"github.com/gin-gonic/gin"
)

// ErrorResponse representa l'estructura d'error segons el contracte OpenAPI.
type ErrorResponse struct {
	Error string `json:"error"`
	Code  string `json:"code"`
}

// RespondError envia una resposta d'error normalitzada.
func RespondError(c *gin.Context, statusCode int, code, message string) {
	c.JSON(statusCode, ErrorResponse{
		Error: message,
		Code:  code,
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
