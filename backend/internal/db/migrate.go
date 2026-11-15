package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/google/uuid"
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

	// Migració idempotent: eliminar la restricció UNIQUE d'editions.year per permetre crear múltiples sortejos
	_, _ = conn.Exec("ALTER TABLE editions DROP CONSTRAINT IF EXISTS editions_year_key;")

	return nil
}

// SeedInitialData assegura l'edició activa i configura l'administrador si està definit a l'entorn.
func SeedInitialData(conn *sql.DB) error {
	// 1. Assegurar edició actual 2026
	seedEdition := `
		INSERT INTO editions (id, year, name, budget_limit, status) VALUES
		('e0000000-0000-0000-0000-000000002026', 2026, 'Nadal 2026', 30.00, 'wishlists_open')
		ON CONFLICT (year) DO NOTHING;
	`
	if _, err := conn.Exec(seedEdition); err != nil {
		return err
	}

	adminEmail := strings.ToLower(strings.TrimSpace(os.Getenv("ADMIN_EMAIL")))
	if adminEmail == "" {
		log.Println("ℹ️ Cap ADMIN_EMAIL configurat a .env.backend. El primer usuari que accedeixi serà administrador automàticament.")
		return nil
	}

	adminName := strings.TrimSpace(os.Getenv("ADMIN_NAME"))
	if adminName == "" {
		adminName = "Administrador"
	}

	log.Printf("👑 Sincronitzant usuari administrador (%s <%s>)...", adminName, adminEmail)

	// 2. Inserir o actualitzar l'Administrador definit a l'entorn
	newID := uuid.New().String()
	var adminUserID string
	err := conn.QueryRow(`
		INSERT INTO users (id, name, email, role) VALUES ($1, $2, $3, 'admin')
		ON CONFLICT (email) DO UPDATE SET role = 'admin', name = EXCLUDED.name
		RETURNING id
	`, newID, adminName, adminEmail).Scan(&adminUserID)
	if err != nil {
		log.Printf("⚠️ Error sincronitzant admin a la BD: %v", err)
		return err
	}

	// 3. Vincular l'Administrador a l'edició activa
	_, err = conn.Exec(`
		INSERT INTO edition_members (edition_id, user_id, is_active)
		VALUES ('e0000000-0000-0000-0000-000000002026', $1, true)
		ON CONFLICT DO NOTHING
	`, adminUserID)
	if err != nil {
		log.Printf("⚠️ Error vinculant admin a l'edició: %v", err)
		return err
	}

	log.Printf("✅ Administrador (%s <%s>) preparat amb èxit!", adminName, adminEmail)
	return nil
}
