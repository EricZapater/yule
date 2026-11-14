package edition

import (
	"net/http"
	"yule/backend/internal/shared"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) GetCurrentEdition(c *gin.Context) {
	ed, err := h.service.GetCurrentEdition()
	if err != nil {
		shared.RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Error obtenint l'edició activa")
		return
	}
	c.JSON(http.StatusOK, ed)
}

func (h *Handler) UpdateCurrentEdition(c *gin.Context) {
	var input UpdateEditionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		shared.RespondError(c, http.StatusBadRequest, "BAD_REQUEST", "Dades d'edició incorrectes")
		return
	}

	ed, err := h.service.UpdateCurrentEdition(input)
	if err != nil {
		shared.RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Error actualitzant l'edició")
		return
	}
	c.JSON(http.StatusOK, ed)
}
