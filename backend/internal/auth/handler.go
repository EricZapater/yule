package auth

import (
	"errors"
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

func (h *Handler) RequestMagicLink(c *gin.Context) {
	var input RequestMagicLinkInput
	if err := c.ShouldBindJSON(&input); err != nil {
		shared.RespondError(c, http.StatusBadRequest, "BAD_REQUEST", "Cal indicar un correu electrònic vàlid")
		return
	}

	_, err := h.service.RequestMagicLink(input.Email)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			shared.RespondError(c, http.StatusBadRequest, "NOT_FOUND", "Aquest correu electrònic no consta a la família")
			return
		}
		shared.RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Error generant enllaç màgic")
		return
	}

	shared.RespondMessage(c, http.StatusOK, "S'ha enviat un enllaç d'accés directe al teu correu")
}

func (h *Handler) VerifyMagicLink(c *gin.Context) {
	var input VerifyMagicLinkInput
	if err := c.ShouldBindJSON(&input); err != nil {
		shared.RespondError(c, http.StatusBadRequest, "BAD_REQUEST", "Cal proporcionar el token de verificació")
		return
	}

	session, err := h.service.VerifyMagicLink(input.Token)
	if err != nil {
		shared.RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "L'enllaç ha caducat o ja s'ha utilitzat")
		return
	}

	c.JSON(http.StatusOK, session)
}

func (h *Handler) GetMe(c *gin.Context) {
	userID, exists := c.Get(shared.ContextUserID)
	if !exists {
		shared.RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Sessió no vàlida")
		return
	}

	user, err := h.service.GetUserByID(userID.(string))
	if err != nil || user == nil {
		shared.RespondError(c, http.StatusNotFound, "NOT_FOUND", "Usuari no trobat")
		return
	}

	c.JSON(http.StatusOK, user)
}
