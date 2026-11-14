package auth

import (
	"time"
)

type User struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type MagicLink struct {
	ID        string     `json:"id"`
	UserID    string     `json:"user_id"`
	Token     string     `json:"token"`
	ExpiresAt time.Time  `json:"expires_at"`
	UsedAt    *time.Time `json:"used_at"`
	CreatedAt time.Time  `json:"created_at"`
}

type RequestMagicLinkInput struct {
	Email string `json:"email" binding:"required,email"`
}

type VerifyMagicLinkInput struct {
	Token string `json:"token" binding:"required"`
}

type AuthSessionResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
