package incompatibility

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

func (h *Handler) ListIncompatibilities(c *gin.Context) {
	list, err := h.service.ListIncompatibilities()
	if err != nil {
		shared.RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Error obtenint les incompatibilitats")
		return
	}
	if list == nil {
		list = []Incompatibility{}
	}
	c.JSON(http.StatusOK, list)
}

func (h *Handler) CreateIncompatibility(c *gin.Context) {
	var input CreateIncompatibilityInput
	if err := c.ShouldBindJSON(&input); err != nil {
		shared.RespondError(c, http.StatusBadRequest, "BAD_REQUEST", "Cal indicar dues persones diferents")
		return
	}

	inc, err := h.service.CreateIncompatibility(input)
	if err != nil {
		shared.RespondError(c, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}

	c.JSON(http.StatusCreated, inc)
}

func (h *Handler) DeleteIncompatibility(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		shared.RespondError(c, http.StatusBadRequest, "BAD_REQUEST", "Identificador requerit")
		return
	}

	if err := h.service.DeleteIncompatibility(id); err != nil {
		shared.RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Error eliminant l'exclusió")
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *Handler) CheckViability(c *gin.Context) {
	res, err := h.service.CheckViability()
	if err != nil {
		shared.RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Error calculant la viabilitat matemàtica")
		return
	}
	c.JSON(http.StatusOK, res)
}
