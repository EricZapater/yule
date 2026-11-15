package edition

import (
	"fmt"
	"log"
	"net/http"
	"strings"
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

func (h *Handler) ListEditions(c *gin.Context) {
	editions, err := h.service.ListEditions()
	if err != nil {
		shared.RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Error obtenint els sortejos")
		return
	}
	c.JSON(http.StatusOK, editions)
}

func (h *Handler) CreateEdition(c *gin.Context) {
	var input CreateEditionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		shared.RespondError(c, http.StatusBadRequest, "BAD_REQUEST", "Dades del nou sorteig incorrectes: "+err.Error())
		return
	}

	ed, err := h.service.CreateEdition(input)
	if err != nil {
		log.Printf("❌ Error creant nou sorteig: %v", err)
		if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "editions_year_key") {
			shared.RespondError(c, http.StatusConflict, "YEAR_EXISTS", fmt.Sprintf("Ja existeix un sorteig registrat per a l'any %d", input.Year))
			return
		}
		shared.RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Error creant el nou sorteig: "+err.Error())
		return
	}
	c.JSON(http.StatusCreated, ed)
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

func (h *Handler) DeleteEdition(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		shared.RespondError(c, http.StatusBadRequest, "BAD_REQUEST", "Identificador requerit")
		return
	}

	if err := h.service.DeleteEdition(id); err != nil {
		shared.RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Error eliminant el sorteig: "+err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Sorteig eliminat correctament"})
}
