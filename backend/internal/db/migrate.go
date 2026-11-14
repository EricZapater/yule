package db

import (
	"database/sql"
	"fmt"
	"os"
)

// AutoMigrate llegeix el fitxer SQL de migració inicial i l'aplica si les taules no existeixen.
func AutoMigrate(conn *sql.DB, migrationFile string) error {
	content, err := os.ReadFile(migrationFile)
	if err != nil {
		return fmt.Errorf("error llegint fitxer de migració %s: %w", migrationFile, err)
	}

	if _, err := conn.Exec(string(content)); err != nil {
		return fmt.Errorf("error executant migració: %w", err)
	}

	return nil
}

// SeedInitialData afegeix l'administrador i la família inicial si la base de dades és buida.
func SeedInitialData(conn *sql.DB) error {
	var count int
	if err := conn.QueryRow("SELECT COUNT(*) FROM users").Scan(&count); err != nil {
		return err
	}

	if count > 0 {
		return nil // Ja hi ha dades
	}

	fmt.Println("🌱 Sembrant dades inicials de la família Yule...")

	// 1. Inserir usuaris
	seedUsers := `
		INSERT INTO users (id, name, email, role) VALUES
		('a0000000-0000-0000-0000-000000000001', 'Pau', 'pau@familia.cat', 'admin'),
		('a0000000-0000-0000-0000-000000000002', 'Mònica', 'monica@familia.cat', 'member'),
		('a0000000-0000-0000-0000-000000000003', 'Jordi (Avi)', 'jordi.avi@familia.cat', 'member'),
		('a0000000-0000-0000-0000-000000000004', 'Carme', 'carme@familia.cat', 'member'),
		('a0000000-0000-0000-0000-000000000005', 'Marc', 'marc@familia.cat', 'member'),
		('a0000000-0000-0000-0000-000000000006', 'Laia', 'laia@familia.cat', 'member')
		ON CONFLICT DO NOTHING;
	`
	if _, err := conn.Exec(seedUsers); err != nil {
		return err
	}

	// 2. Inserir Edició actual
	seedEdition := `
		INSERT INTO editions (id, year, name, budget_limit, status) VALUES
		('e0000000-0000-0000-0000-000000002026', 2026, 'Nadal 2026', 30.00, 'wishlists_open')
		ON CONFLICT DO NOTHING;
	`
	if _, err := conn.Exec(seedEdition); err != nil {
		return err
	}

	// 3. Associar membres a l'edició
	seedMembers := `
		INSERT INTO edition_members (edition_id, user_id, is_active)
		SELECT 'e0000000-0000-0000-0000-000000002026', id, true FROM users
		ON CONFLICT DO NOTHING;
	`
	if _, err := conn.Exec(seedMembers); err != nil {
		return err
	}

	// 4. Inserir incompatibilitat d'exemple (Jordi <-> Mònica mútua)
	seedIncomp := `
		INSERT INTO incompatibilities (id, edition_id, person1_id, person2_id, is_mutual, notes) VALUES
		('i0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000002026', 
		 'a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', true, 'Parella')
		ON CONFLICT DO NOTHING;
	`
	if _, err := conn.Exec(seedIncomp); err != nil {
		return err
	}

	// 5. Inserir un parell de desitjos de mostra per a la Mònica
	seedWishlist := `
		INSERT INTO wishlist_items (id, edition_id, user_id, title, price_estimated, notes) VALUES
		('w0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000002026', 
		 'a0000000-0000-0000-0000-000000000002', 'Bufanda de llana verda', 24.90, 'Com la de l''aparador del carrer Major'),
		('w0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000002026', 
		 'a0000000-0000-0000-0000-000000000002', 'Llibre Mirall Trencat (Mercè Rodoreda)', 18.50, 'Edició Club Editor')
		ON CONFLICT DO NOTHING;
	`
	if _, err := conn.Exec(seedWishlist); err != nil {
		return err
	}

	fmt.Println("✅ Família sembrada amb èxit!")
	return nil
}
