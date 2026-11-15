package draw

import (
	"database/sql"
	"errors"
	"time"
	"yule/backend/internal/wishlist"

	"github.com/google/uuid"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

// GetActiveParticipantsWithEmail retorna els participants actius i els seus correus per a les notificacions.
func (r *Repository) GetActiveParticipantsWithEmail(editionID string) ([]Participant, map[string]string, error) {
	query := `
		SELECT u.id, u.name, u.email
		FROM users u
		JOIN edition_members em ON em.user_id = u.id AND em.edition_id = $1
		WHERE em.is_active = true
	`
	rows, err := r.db.Query(query, editionID)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var participants []Participant
	emails := make(map[string]string)
	for rows.Next() {
		var p Participant
		var email string
		if err := rows.Scan(&p.ID, &p.Name, &email); err != nil {
			return nil, nil, err
		}
		participants = append(participants, p)
		emails[p.ID] = email
	}
	return participants, emails, nil
}

// GetIncompatibilityRules retorna les regles per al motor de sorteig.
func (r *Repository) GetIncompatibilityRules(editionID string) ([]IncompatibilityRule, error) {
	query := `SELECT person1_id, person2_id, is_mutual FROM incompatibilities WHERE edition_id = $1`
	rows, err := r.db.Query(query, editionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rules []IncompatibilityRule
	for rows.Next() {
		var p1, p2 string
		var isMutual bool
		if err := rows.Scan(&p1, &p2, &isMutual); err != nil {
			return nil, err
		}
		rules = append(rules, IncompatibilityRule{
			GiverID:    p1,
			ReceiverID: p2,
		})
		if isMutual {
			rules = append(rules, IncompatibilityRule{
				GiverID:    p2,
				ReceiverID: p1,
			})
		}
	}
	return rules, nil
}

// SaveAssignmentsTransactional desa totes les assignacions en una única transacció atòmica.
func (r *Repository) SaveAssignmentsTransactional(editionID string, results []AssignmentResult) (time.Time, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return time.Time{}, err
	}
	defer tx.Rollback()

	// Eliminar assignacions prèvies d'aquesta edició si s'està repetint
	if _, err := tx.Exec(`DELETE FROM assignments WHERE edition_id = $1`, editionID); err != nil {
		return time.Time{}, err
	}

	insertQuery := `INSERT INTO assignments (id, edition_id, giver_id, receiver_id) VALUES ($1, $2, $3, $4)`
	for _, pair := range results {
		assignID := uuid.New().String()
		if _, err := tx.Exec(insertQuery, assignID, editionID, pair.GiverID, pair.ReceiverID); err != nil {
			return time.Time{}, err
		}
	}

	now := time.Now()
	updateEdQuery := `UPDATE editions SET status = 'drawn', drawn_at = $1 WHERE id = $2`
	if _, err := tx.Exec(updateEdQuery, now, editionID); err != nil {
		return time.Time{}, err
	}

	if err := tx.Commit(); err != nil {
		return time.Time{}, err
	}

	return now, nil
}

// GetEditionAssignments retorna totes les parelles assignades d'una edició.
func (r *Repository) GetEditionAssignments(editionID string) ([]AssignmentResult, error) {
	query := `SELECT giver_id, receiver_id FROM assignments WHERE edition_id = $1`
	rows, err := r.db.Query(query, editionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []AssignmentResult
	for rows.Next() {
		var a AssignmentResult
		if err := rows.Scan(&a.GiverID, &a.ReceiverID); err != nil {
			return nil, err
		}
		list = append(list, a)
	}
	return list, nil
}

// GetEditionWishlists retorna tots els desitjos de l'edició agrupats per user_id.
func (r *Repository) GetEditionWishlists(editionID string) (map[string][]wishlist.WishlistItem, error) {
	query := `
		SELECT id, edition_id, user_id, title, price_estimated, url, image_url, notes, created_at
		FROM wishlist_items
		WHERE edition_id = $1
		ORDER BY created_at ASC
	`
	rows, err := r.db.Query(query, editionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make(map[string][]wishlist.WishlistItem)
	for rows.Next() {
		var it wishlist.WishlistItem
		if err := rows.Scan(&it.ID, &it.EditionID, &it.UserID, &it.Title, &it.PriceEstimated, &it.URL, &it.ImageURL, &it.Notes, &it.CreatedAt); err != nil {
			return nil, err
		}
		result[it.UserID] = append(result[it.UserID], it)
	}
	return result, nil
}

// GetMyAssignment retorna el receptor assignat i els seus articles de desitjos (i l'estat marcat pel regalador).
func (r *Repository) GetMyAssignment(editionID, giverID string) (*RecipientSummary, []AssignedWishlistItem, error) {
	var recipient RecipientSummary
	query := `
		SELECT u.id, u.name
		FROM assignments a
		JOIN users u ON u.id = a.receiver_id
		WHERE a.edition_id = $1 AND a.giver_id = $2
		LIMIT 1
	`
	err := r.db.QueryRow(query, editionID, giverID).Scan(&recipient.ID, &recipient.Name)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil, nil
	}
	if err != nil {
		return nil, nil, err
	}

	// Obtenir la llista de desitjos del receptor amb la marca de comprat del regalador
	wishQuery := `
		SELECT 
			w.id, w.edition_id, w.title, w.price_estimated, w.url, w.image_url, w.notes, w.created_at,
			COALESCE(p.is_purchased, false) as is_marked
		FROM wishlist_items w
		LEFT JOIN purchased_items p ON p.item_id = w.id AND p.giver_id = $1
		WHERE w.edition_id = $2 AND w.user_id = $3
		ORDER BY w.created_at ASC
	`
	rows, err := r.db.Query(wishQuery, giverID, editionID, recipient.ID)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var items []AssignedWishlistItem
	for rows.Next() {
		var it wishlist.WishlistItem
		var isMarked bool
		if err := rows.Scan(
			&it.ID, &it.EditionID, &it.Title, &it.PriceEstimated, &it.URL, &it.ImageURL, &it.Notes, &it.CreatedAt, &isMarked,
		); err != nil {
			return nil, nil, err
		}
		items = append(items, AssignedWishlistItem{
			WishlistItem: it,
			IsMarkedByMe: isMarked,
		})
	}

	return &recipient, items, nil
}

// MarkItemPurchased permet al regalador marcar un article com a comprat per a la seva organització.
func (r *Repository) MarkItemPurchased(giverID, itemID string, isPurchased bool) error {
	query := `
		INSERT INTO purchased_items (giver_id, item_id, is_purchased)
		VALUES ($1, $2, $3)
		ON CONFLICT (giver_id, item_id)
		DO UPDATE SET is_purchased = $3
	`
	_, err := r.db.Exec(query, giverID, itemID, isPurchased)
	return err
}

// ResetAssignmentsTransactional elimina les parelles assignades i les compres marcades, i restableix l'estat a wishlists_open.
func (r *Repository) ResetAssignmentsTransactional(editionID string) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Eliminar compres d'aquesta edició
	deletePurchased := `
		DELETE FROM purchased_items 
		WHERE item_id IN (SELECT id FROM wishlist_items WHERE edition_id = $1)
	`
	if _, err := tx.Exec(deletePurchased, editionID); err != nil {
		return err
	}

	// 2. Eliminar assignacions de l'edició
	if _, err := tx.Exec(`DELETE FROM assignments WHERE edition_id = $1`, editionID); err != nil {
		return err
	}

	// 3. Restablir l'edició
	resetEdition := `UPDATE editions SET status = 'wishlists_open', drawn_at = NULL WHERE id = $1`
	if _, err := tx.Exec(resetEdition, editionID); err != nil {
		return err
	}

	return tx.Commit()
}

