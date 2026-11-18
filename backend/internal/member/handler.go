package member

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

func (h *Handler) ListMembers(c *gin.Context) {
	members, err := h.service.ListMembers()
	if err != nil {
		shared.RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Error obtenint la llista de familiars")
		return
	}
	c.JSON(http.StatusOK, members)
}

func (h *Handler) CreateMember(c *gin.Context) {
	var input CreateMemberInput
	if err := c.ShouldBindJSON(&input); err != nil {
		shared.RespondError(c, http.StatusBadRequest, "BAD_REQUEST", "Cal proporcionar nom i correu vàlids")
		return
	}

	m, err := h.service.CreateMember(input.Name, input.Email)
	if err != nil {
		shared.RespondError(c, http.StatusBadRequest, "BAD_REQUEST", "No s'ha pogut registrar el familiar (possible correu duplicat)")
		return
	}
	c.JSON(http.StatusCreated, m)
}

func (h *Handler) UpdateMember(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		shared.RespondError(c, http.StatusBadRequest, "BAD_REQUEST", "Identificador requerit")
		return
	}

	var input UpdateMemberInput
	if err := c.ShouldBindJSON(&input); err != nil {
		shared.RespondError(c, http.StatusBadRequest, "BAD_REQUEST", "Dades incorrectes")
		return
	}

	if err := h.service.UpdateMember(id, input); err != nil {
		shared.RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Error actualitzant dades del familiar")
		return
	}

	shared.RespondMessage(c, http.StatusOK, "Familiar actualitzat correctament")
}

func (h *Handler) DeleteMember(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		shared.RespondError(c, http.StatusBadRequest, "BAD_REQUEST", "Identificador requerit")
		return
	}

	if err := h.service.DeleteMember(id); err != nil {
		shared.RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Error eliminant el familiar: "+err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Familiar eliminat correctament"})
}

func (h *Handler) ClearMemberWishlist(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		shared.RespondError(c, http.StatusBadRequest, "BAD_REQUEST", "Identificador requerit")
		return
	}

	if err := h.service.ClearMemberWishlist(id); err != nil {
		shared.RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Error buidant la llista de desitjos: "+err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Llista de desitjos buidada correctament"})
}

