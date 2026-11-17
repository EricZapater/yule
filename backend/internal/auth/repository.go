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
	query := `
		SELECT id, name, email, role, COALESCE(created_at, NOW()), COALESCE(updated_at, NOW())
		FROM users 
		WHERE LOWER(TRIM(email)) = LOWER(TRIM($1)) 
		LIMIT 1
	`
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
	query := `SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1::uuid LIMIT 1`
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
	query := `INSERT INTO magic_links (id, user_id, token, expires_at) VALUES ($1::uuid, $2::uuid, $3, $4)`
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
	query := `UPDATE magic_links SET used_at = NOW() WHERE id = $1::uuid`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *Repository) CreateUser(id, name, email, role string) (*User, error) {
	query := `
		INSERT INTO users (id, name, email, role)
		VALUES ($1::uuid, $2, LOWER(TRIM($3)), $4)
		RETURNING id, name, email, role, created_at, updated_at
	`
	var u User
	err := r.db.QueryRow(query, id, name, email, role).Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *Repository) UpdateUserName(id, name string) error {
	query := `UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2::uuid`
	_, err := r.db.Exec(query, name, id)
	return err
}

func (r *Repository) AttachToEdition(editionID, userID string) error {
	query := `
		INSERT INTO edition_members (edition_id, user_id, is_active) 
		VALUES ($1::uuid, $2::uuid, true) 
		ON CONFLICT (edition_id, user_id) DO NOTHING
	`
	_, err := r.db.Exec(query, editionID, userID)
	return err
}

func (r *Repository) CountUsers() (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM users`
	err := r.db.QueryRow(query).Scan(&count)
	return count, err
}

func (r *Repository) GetActiveEditionID() (string, error) {
	var id string
	query := `SELECT id FROM editions ORDER BY year DESC, created_at DESC LIMIT 1`
	err := r.db.QueryRow(query).Scan(&id)
	return id, err
}
