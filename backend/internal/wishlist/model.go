package wishlist

import (
	"time"
)

type WishlistItem struct {
	ID             string    `json:"id"`
	EditionID      string    `json:"edition_id"`
	UserID         string    `json:"user_id,omitempty"`
	Title          string    `json:"title"`
	PriceEstimated *float64  `json:"price_estimated"`
	URL            *string   `json:"url"`
	ImageURL       *string   `json:"image_url"`
	Notes          *string   `json:"notes"`
	CreatedAt      time.Time `json:"created_at"`
}

type CreateWishlistItemRequest struct {
	Title          string   `json:"title" binding:"required"`
	PriceEstimated *float64 `json:"price_estimated"`
	URL            *string  `json:"url"`
	ImageURL       *string  `json:"image_url"`
	Notes          *string  `json:"notes"`
}
