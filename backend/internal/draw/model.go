package draw

import (
	"time"
	"yule/backend/internal/wishlist"
)

type DrawExecutionResponse struct {
	Status            string    `json:"status"`
	DrawnAt           time.Time `json:"drawn_at"`
	ParticipantsCount int       `json:"participants_count"`
	EmailsDispatched  int       `json:"emails_dispatched"`
}

type RecipientSummary struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type AssignedWishlistItem struct {
	wishlist.WishlistItem
	IsMarkedByMe bool `json:"is_marked_by_me"`
}

type AssignmentResponse struct {
	Recipient   RecipientSummary       `json:"recipient"`
	BudgetLimit float64                `json:"budget_limit"`
	Wishlist    []AssignedWishlistItem `json:"wishlist"`
}

type MarkPurchasedInput struct {
	IsPurchased bool `json:"is_purchased"`
}
