package member

import (
	"time"
)

type MemberAdminView struct {
	ID                 string    `json:"id"`
	Name               string    `json:"name"`
	Email              string    `json:"email"`
	Role               string    `json:"role"`
	IsActive           bool      `json:"is_active"`
	WishlistItemsCount int       `json:"wishlist_items_count"`
	MagicLinkURL       string    `json:"magic_link_url"`
	CreatedAt          time.Time `json:"created_at"`
}

type CreateMemberInput struct {
	Name  string `json:"name" binding:"required"`
	Email string `json:"email" binding:"required,email"`
}

type UpdateMemberInput struct {
	Name     *string `json:"name"`
	Email    *string `json:"email"`
	IsActive *bool   `json:"is_active"`
}
