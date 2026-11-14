package draw

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

func (h *Handler) ExecuteDraw(c *gin.Context) {
	resp, err := h.service.ExecuteDraw()
	if err != nil {
		if errors.Is(err, ErrTooFewParticipants) {
			shared.RespondError(c, http.StatusBadRequest, "TOO_FEW_PARTICIPANTS", "Cal un mínim de 3 participants per fer el sorteig")
			return
		}
		if errors.Is(err, ErrNoViableSolution) {
			shared.RespondError(c, http.StatusBadRequest, "INCOMPATIBLE_RULES", "Les incompatibilitats actuals fan impossible trobar una solució")
			return
		}
		shared.RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Error executant el sorteig: "+err.Error())
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) GetMyAssignment(c *gin.Context) {
	userID, exists := c.Get(shared.ContextUserID)
	if !exists {
		shared.RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Sessió requerida")
		return
	}

	resp, err := h.service.GetMyAssignment(userID.(string))
	if err != nil {
		if errors.Is(err, ErrDrawNotReady) {
			shared.RespondError(c, http.StatusNotFound, "DRAW_NOT_READY", "El sorteig encara no s'ha realitzat")
			return
		}
		shared.RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Error obtenint la teva assignació")
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) MarkItemPurchased(c *gin.Context) {
	userID, exists := c.Get(shared.ContextUserID)
	if !exists {
		shared.RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Sessió requerida")
		return
	}

	itemID := c.Param("item_id")
	if itemID == "" {
		shared.RespondError(c, http.StatusBadRequest, "BAD_REQUEST", "Identificador requerit")
		return
	}

	var input MarkPurchasedInput
	if err := c.ShouldBindJSON(&input); err != nil {
		shared.RespondError(c, http.StatusBadRequest, "BAD_REQUEST", "Dades incorrectes")
		return
	}

	if err := h.service.MarkItemPurchased(userID.(string), itemID, input.IsPurchased); err != nil {
		shared.RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Error marcant l'article")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"item_id":      itemID,
		"is_purchased": input.IsPurchased,
	})
}
