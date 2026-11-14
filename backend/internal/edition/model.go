package edition

import (
	"time"
)

type Edition struct {
	ID          string     `json:"id"`
	Year        int        `json:"year"`
	Name        string     `json:"name"`
	BudgetLimit float64    `json:"budget_limit"`
	Status      string     `json:"status"` // draft, wishlists_open, drawn, closed
	DrawnAt     *time.Time `json:"drawn_at"`
	CreatedAt   time.Time  `json:"created_at"`
}

type UpdateEditionInput struct {
	Name        *string  `json:"name"`
	BudgetLimit *float64 `json:"budget_limit"`
}
