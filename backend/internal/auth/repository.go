package auth

import (
	"database/sql"
	"errors"
	"time"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindUserByEmail(email string) (*User, error) {
	query := `SELECT id, name, email, role, created_at, updated_at FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`
	var u User
	err := r.db.QueryRow(query, email).Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *Repository) FindUserByID(id string) (*User, error) {
	query := `SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1 LIMIT 1`
	var u User
	err := r.db.QueryRow(query, id).Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *Repository) CreateMagicLink(id, userID, token string, expiresAt time.Time) error {
	query := `INSERT INTO magic_links (id, user_id, token, expires_at) VALUES ($1, $2, $3, $4)`
	_, err := r.db.Exec(query, id, userID, token, expiresAt)
	return err
}

func (r *Repository) FindValidMagicLink(token string) (*MagicLink, error) {
	query := `SELECT id, user_id, token, expires_at, used_at, created_at FROM magic_links WHERE token = $1 AND used_at IS NULL AND expires_at > NOW() LIMIT 1`
	var ml MagicLink
	err := r.db.QueryRow(query, token).Scan(&ml.ID, &ml.UserID, &ml.Token, &ml.ExpiresAt, &ml.UsedAt, &ml.CreatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &ml, nil
}

func (r *Repository) MarkMagicLinkUsed(id string) error {
	query := `UPDATE magic_links SET used_at = NOW() WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}
