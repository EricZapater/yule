package member

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) ListMembersWithWishlistCount(editionID string) ([]MemberAdminView, error) {
	query := `
		SELECT 
			u.id, 
			u.name, 
			u.email, 
			u.role, 
			COALESCE(em.is_active, true) as is_active,
			(SELECT COUNT(*) FROM wishlist_items w WHERE w.user_id = u.id AND w.edition_id = $1) as wishlist_count,
			u.created_at
		FROM users u
		LEFT JOIN edition_members em ON em.user_id = u.id AND em.edition_id = $1
		ORDER BY u.name ASC
	`

	rows, err := r.db.Query(query, editionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []MemberAdminView
	for rows.Next() {
		var m MemberAdminView
		if err := rows.Scan(&m.ID, &m.Name, &m.Email, &m.Role, &m.IsActive, &m.WishlistItemsCount, &m.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, m)
	}
	return list, nil
}

func (r *Repository) CreateUser(name, email, role string) (string, error) {
	id := uuid.New().String()
	query := `INSERT INTO users (id, name, email, role) VALUES ($1::uuid, $2, LOWER(TRIM($3)), $4) RETURNING id`
	var returnedID string
	err := r.db.QueryRow(query, id, name, email, role).Scan(&returnedID)
	return returnedID, err
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

func (r *Repository) UpdateMember(editionID, userID string, name, email *string, isActive *bool) error {
	if name != nil || email != nil {
		query := `UPDATE users SET name = COALESCE($1, name), email = LOWER(TRIM(COALESCE($2, email))), updated_at = NOW() WHERE id = $3::uuid`
		if _, err := r.db.Exec(query, name, email, userID); err != nil {
			return err
		}
	}

	if isActive != nil {
		query := `
			INSERT INTO edition_members (edition_id, user_id, is_active) 
			VALUES ($1::uuid, $2::uuid, $3) 
			ON CONFLICT (edition_id, user_id) 
			DO UPDATE SET is_active = $3
		`
		if _, err := r.db.Exec(query, editionID, userID, *isActive); err != nil {
			return err
		}
	}

	return nil
}

func (r *Repository) CreateQuickMagicToken(userID string) (string, error) {
	id := uuid.New().String()
	token := "ml_" + uuid.New().String()
	expiresAt := time.Now().Add(90 * 24 * time.Hour) // 90 dies per l'enllaç de WhatsApp de la família
	query := `INSERT INTO magic_links (id, user_id, token, expires_at) VALUES ($1::uuid, $2::uuid, $3, $4)`
	_, err := r.db.Exec(query, id, userID, token, expiresAt)
	return token, err
}
