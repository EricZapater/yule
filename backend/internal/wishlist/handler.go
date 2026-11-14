package wishlist

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

func (h *Handler) GetMyWishlist(c *gin.Context) {
	userID, exists := c.Get(shared.ContextUserID)
	if !exists {
		shared.RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Sessió requerida")
		return
	}

	items, err := h.service.GetMyWishlist(userID.(string))
	if err != nil {
		shared.RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Error obtenint la llista de desitjos")
		return
	}

	if items == nil {
		items = []WishlistItem{}
	}
	c.JSON(http.StatusOK, items)
}

func (h *Handler) AddWishlistItem(c *gin.Context) {
	userID, exists := c.Get(shared.ContextUserID)
	if !exists {
		shared.RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Sessió requerida")
		return
	}

	var req CreateWishlistItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		shared.RespondError(c, http.StatusBadRequest, "BAD_REQUEST", "Cal indicar com a mínim el títol del regal")
		return
	}

	item, err := h.service.AddItem(userID.(string), req)
	if err != nil {
		shared.RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Error desant el regal")
		return
	}

	c.JSON(http.StatusCreated, item)
}

func (h *Handler) UpdateWishlistItem(c *gin.Context) {
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

	var req CreateWishlistItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		shared.RespondError(c, http.StatusBadRequest, "BAD_REQUEST", "Dades del regal invàlides")
		return
	}

	item, err := h.service.UpdateItem(itemID, userID.(string), req)
	if err != nil {
		if errors.Is(err, ErrItemNotFound) {
			shared.RespondError(c, http.StatusNotFound, "NOT_FOUND", "Article no trobat")
			return
		}
		shared.RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Error actualitzant el regal")
		return
	}

	c.JSON(http.StatusOK, item)
}

func (h *Handler) DeleteWishlistItem(c *gin.Context) {
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

	if err := h.service.DeleteItem(itemID, userID.(string)); err != nil {
		shared.RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Error eliminant el regal")
		return
	}

	c.Status(http.StatusNoContent)
}
