package edition

import (
	"database/sql"
	"errors"
	"log"
	"time"

	"github.com/google/uuid"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

// GetOrCreateCurrentEdition retorna el sorteig més recent o el crea automàticament si no en consta cap.
func (r *Repository) GetOrCreateCurrentEdition() (*Edition, error) {
	query := `SELECT id, year, name, budget_limit, status, drawn_at, created_at FROM editions ORDER BY year DESC, created_at DESC LIMIT 1`
	var ed Edition
	err := r.db.QueryRow(query).Scan(&ed.ID, &ed.Year, &ed.Name, &ed.BudgetLimit, &ed.Status, &ed.DrawnAt, &ed.CreatedAt)
	if err == nil {
		return &ed, nil
	}
	if !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}

	// Si no existeix cap edició, la creem per defecte per a l'any actual
	currentYear := time.Now().Year()
	newID := uuid.New().String()
	name := "Nadal " + time.Now().Format("2006")
	insertQuery := `INSERT INTO editions (id, year, name, budget_limit, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, year, name, budget_limit, status, drawn_at, created_at`
	err = r.db.QueryRow(insertQuery, newID, currentYear, name, 30.00, "wishlists_open").Scan(&ed.ID, &ed.Year, &ed.Name, &ed.BudgetLimit, &ed.Status, &ed.DrawnAt, &ed.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &ed, nil
}

// ListEditions retorna tots els sortejos registrats a la família.
func (r *Repository) ListEditions() ([]Edition, error) {
	query := `SELECT id, year, name, budget_limit, status, drawn_at, created_at FROM editions ORDER BY year DESC, created_at DESC`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []Edition
	for rows.Next() {
		var ed Edition
		if err := rows.Scan(&ed.ID, &ed.Year, &ed.Name, &ed.BudgetLimit, &ed.Status, &ed.DrawnAt, &ed.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, ed)
	}
	return list, nil
}

// CreateEdition crea un nou sorteig (mestre) i opcionalment hi vincula automàticament els familiars existents.
func (r *Repository) CreateEdition(year int, name string, budgetLimit float64, copyMembers bool) (*Edition, error) {
	newID := uuid.New().String()
	insertQuery := `
		INSERT INTO editions (id, year, name, budget_limit, status) 
		VALUES ($1::uuid, $2, $3, $4, 'wishlists_open') 
		RETURNING id, year, name, budget_limit, status, drawn_at, created_at
	`
	var ed Edition
	err := r.db.QueryRow(insertQuery, newID, year, name, budgetLimit).Scan(&ed.ID, &ed.Year, &ed.Name, &ed.BudgetLimit, &ed.Status, &ed.DrawnAt, &ed.CreatedAt)
	if err != nil {
		log.Printf("❌ Error creant edició a la base de dades (Any: %d, Nom: %s): %v", year, name, err)
		return nil, err
	}

	if copyMembers {
		copyQuery := `
			INSERT INTO edition_members (edition_id, user_id, is_active)
			SELECT $1::uuid, id, true FROM users
			ON CONFLICT DO NOTHING
		`
		if _, err := r.db.Exec(copyQuery, ed.ID); err != nil {
			log.Printf("⚠️ Error copiant membres a la nova edició: %v", err)
		} else {
			log.Printf("👥 Membres vinculats correctament a la nova edició %s", ed.Name)
		}
	}

	return &ed, nil
}

func (r *Repository) UpdateEdition(id string, name string, budgetLimit float64) (*Edition, error) {
	query := `UPDATE editions SET name = $1, budget_limit = $2 WHERE id = $3 RETURNING id, year, name, budget_limit, status, drawn_at, created_at`
	var ed Edition
	err := r.db.QueryRow(query, name, budgetLimit, id).Scan(&ed.ID, &ed.Year, &ed.Name, &ed.BudgetLimit, &ed.Status, &ed.DrawnAt, &ed.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &ed, nil
}

func (r *Repository) DeleteEdition(id string) error {
	_, err := r.db.Exec(`DELETE FROM editions WHERE id = $1`, id)
	return err
}
