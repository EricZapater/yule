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

type CreateEditionInput struct {
	Year        int     `json:"year" binding:"required"`
	Name        string  `json:"name" binding:"required"`
	BudgetLimit float64 `json:"budget_limit"`
	CopyMembers bool    `json:"copy_members"`
}
