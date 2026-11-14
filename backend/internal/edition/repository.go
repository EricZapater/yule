package edition

import (
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

// GetOrCreateCurrentEdition retorna l'edició de l'any actual o la crea automàticament si no existeix.
func (r *Repository) GetOrCreateCurrentEdition() (*Edition, error) {
	currentYear := time.Now().Year()

	query := `SELECT id, year, name, budget_limit, status, drawn_at, created_at FROM editions WHERE year = $1 LIMIT 1`
	var ed Edition
	err := r.db.QueryRow(query, currentYear).Scan(&ed.ID, &ed.Year, &ed.Name, &ed.BudgetLimit, &ed.Status, &ed.DrawnAt, &ed.CreatedAt)
	if err == nil {
		return &ed, nil
	}
	if !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}

	// Si no existeix, la creem
	newID := uuid.New().String()
	name := "Nadal " + time.Now().Format("2006")
	insertQuery := `INSERT INTO editions (id, year, name, budget_limit, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, year, name, budget_limit, status, drawn_at, created_at`
	err = r.db.QueryRow(insertQuery, newID, currentYear, name, 30.00, "wishlists_open").Scan(&ed.ID, &ed.Year, &ed.Name, &ed.BudgetLimit, &ed.Status, &ed.DrawnAt, &ed.CreatedAt)
	if err != nil {
		return nil, err
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
