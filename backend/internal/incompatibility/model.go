package incompatibility

import (
	"time"
)

type UserSummary struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type Incompatibility struct {
	ID        string      `json:"id"`
	Person1   UserSummary `json:"person1"`
	Person2   UserSummary `json:"person2"`
	IsMutual  bool        `json:"is_mutual"`
	Notes     *string     `json:"notes"`
	CreatedAt time.Time   `json:"created_at"`
}

type CreateIncompatibilityInput struct {
	Person1ID string  `json:"person1_id" binding:"required"`
	Person2ID string  `json:"person2_id" binding:"required"`
	IsMutual  bool    `json:"is_mutual"`
	Notes     *string `json:"notes"`
}

type ViabilityCheckResponse struct {
	IsViable          bool    `json:"is_viable"`
	ParticipantsCount int     `json:"participants_count"`
	ActiveRulesCount  int     `json:"active_rules_count"`
	Reason            *string `json:"reason"`
}
