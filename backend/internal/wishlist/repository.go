package wishlist

import (
	"database/sql"
	"errors"

	"github.com/google/uuid"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) GetUserWishlist(editionID, userID string) ([]WishlistItem, error) {
	query := `
		SELECT id, edition_id, user_id, title, price_estimated, url, image_url, notes, created_at
		FROM wishlist_items
		WHERE edition_id = $1 AND user_id = $2
		ORDER BY created_at ASC
	`
	rows, err := r.db.Query(query, editionID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []WishlistItem
	for rows.Next() {
		var it WishlistItem
		if err := rows.Scan(&it.ID, &it.EditionID, &it.UserID, &it.Title, &it.PriceEstimated, &it.URL, &it.ImageURL, &it.Notes, &it.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, it)
	}
	return items, nil
}

func (r *Repository) CreateItem(editionID, userID string, req CreateWishlistItemRequest) (*WishlistItem, error) {
	id := uuid.New().String()
	query := `
		INSERT INTO wishlist_items (id, edition_id, user_id, title, price_estimated, url, image_url, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, edition_id, user_id, title, price_estimated, url, image_url, notes, created_at
	`
	var it WishlistItem
	err := r.db.QueryRow(query, id, editionID, userID, req.Title, req.PriceEstimated, req.URL, req.ImageURL, req.Notes).
		Scan(&it.ID, &it.EditionID, &it.UserID, &it.Title, &it.PriceEstimated, &it.URL, &it.ImageURL, &it.Notes, &it.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &it, nil
}

func (r *Repository) UpdateItem(itemID, userID string, req CreateWishlistItemRequest) (*WishlistItem, error) {
	query := `
		UPDATE wishlist_items
		SET title = $1, price_estimated = $2, url = $3, image_url = $4, notes = $5
		WHERE id = $6 AND user_id = $7
		RETURNING id, edition_id, user_id, title, price_estimated, url, image_url, notes, created_at
	`
	var it WishlistItem
	err := r.db.QueryRow(query, req.Title, req.PriceEstimated, req.URL, req.ImageURL, req.Notes, itemID, userID).
		Scan(&it.ID, &it.EditionID, &it.UserID, &it.Title, &it.PriceEstimated, &it.URL, &it.ImageURL, &it.Notes, &it.CreatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &it, nil
}

func (r *Repository) DeleteItem(itemID, userID string) error {
	query := `DELETE FROM wishlist_items WHERE id = $1 AND user_id = $2`
	_, err := r.db.Exec(query, itemID, userID)
	return err
}

// CopyPreviousWishlist copia els desitjos que l'usuari tenia en un sorteig/edició anterior cap a l'edició actual.
func (r *Repository) CopyPreviousWishlist(currentEditionID, userID string) (int, error) {
	// Trobar l'edició anterior on l'usuari tenia desitjos
	queryPrev := `
		SELECT edition_id 
		FROM wishlist_items 
		WHERE user_id = $1 AND edition_id <> $2 
		ORDER BY created_at DESC 
		LIMIT 1
	`
	var prevEditionID string
	err := r.db.QueryRow(queryPrev, userID, currentEditionID).Scan(&prevEditionID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, nil // No hi ha cap edició anterior amb desitjos
		}
		return 0, err
	}

	// Copiar els desitjos de l'edició anterior que no estiguin ja a l'edició actual (per títol)
	queryCopy := `
		INSERT INTO wishlist_items (id, edition_id, user_id, title, price_estimated, url, image_url, notes)
		SELECT gen_random_uuid(), $1, user_id, title, price_estimated, url, image_url, notes
		FROM wishlist_items
		WHERE edition_id = $2 AND user_id = $3
		  AND title NOT IN (SELECT title FROM wishlist_items WHERE edition_id = $1 AND user_id = $3)
	`
	res, err := r.db.Exec(queryCopy, currentEditionID, prevEditionID, userID)
	if err != nil {
		return 0, err
	}
	count, _ := res.RowsAffected()
	return int(count), nil
}
