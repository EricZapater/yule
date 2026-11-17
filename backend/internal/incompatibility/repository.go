package incompatibility

import (
	"database/sql"
	"yule/backend/internal/draw"

	"github.com/google/uuid"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) ListIncompatibilities(editionID string) ([]Incompatibility, error) {
	query := `
		SELECT 
			i.id, 
			i.person1_id, u1.name as p1_name,
			i.person2_id, u2.name as p2_name,
			i.is_mutual, i.notes, i.created_at
		FROM incompatibilities i
		JOIN users u1 ON u1.id = i.person1_id
		JOIN users u2 ON u2.id = i.person2_id
		WHERE i.edition_id = $1
		ORDER BY i.created_at DESC
	`
	rows, err := r.db.Query(query, editionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []Incompatibility
	for rows.Next() {
		var inc Incompatibility
		if err := rows.Scan(
			&inc.ID,
			&inc.Person1.ID, &inc.Person1.Name,
			&inc.Person2.ID, &inc.Person2.Name,
			&inc.IsMutual, &inc.Notes, &inc.CreatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, inc)
	}
	return list, nil
}

func (r *Repository) CreateIncompatibility(editionID, p1, p2 string, isMutual bool, notes *string) (*Incompatibility, error) {
	id := uuid.New().String()
	query := `
		INSERT INTO incompatibilities (id, edition_id, person1_id, person2_id, is_mutual, notes)
		VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5, $6)
	`
	if _, err := r.db.Exec(query, id, editionID, p1, p2, isMutual, notes); err != nil {
		return nil, err
	}

	// Recuperar els noms
	fetchQuery := `
		SELECT 
			i.id, 
			i.person1_id, u1.name,
			i.person2_id, u2.name,
			i.is_mutual, i.notes, i.created_at
		FROM incompatibilities i
		JOIN users u1 ON u1.id = i.person1_id
		JOIN users u2 ON u2.id = i.person2_id
		WHERE i.id = $1::uuid
	`
	var inc Incompatibility
	err := r.db.QueryRow(fetchQuery, id).Scan(
		&inc.ID,
		&inc.Person1.ID, &inc.Person1.Name,
		&inc.Person2.ID, &inc.Person2.Name,
		&inc.IsMutual, &inc.Notes, &inc.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &inc, nil
}

func (r *Repository) DeleteIncompatibility(id string) error {
	query := `DELETE FROM incompatibilities WHERE id = $1::uuid`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *Repository) GetActiveParticipants(editionID string) ([]draw.Participant, error) {
	query := `
		SELECT u.id, u.name 
		FROM users u
		JOIN edition_members em ON em.user_id = u.id AND em.edition_id = $1
		WHERE em.is_active = true
	`
	rows, err := r.db.Query(query, editionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []draw.Participant
	for rows.Next() {
		var p draw.Participant
		if err := rows.Scan(&p.ID, &p.Name); err != nil {
			return nil, err
		}
		list = append(list, p)
	}
	return list, nil
}
