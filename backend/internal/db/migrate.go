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

// SeedInitialData afegeix l'administrador i l'edició si no existeixen.
func SeedInitialData(conn *sql.DB) error {
	adminEmail := os.Getenv("ADMIN_EMAIL")
	if adminEmail == "" {
		adminEmail = "eric@zapater.cat"
	}
	adminName := os.Getenv("ADMIN_NAME")
	if adminName == "" {
		adminName = "Èric"
	}

	fmt.Printf("🌱 Verificant usuari administrador (%s <%s>)...\n", adminName, adminEmail)

	// 1. Assegurar edició actual 2026
	seedEdition := `
		INSERT INTO editions (id, year, name, budget_limit, status) VALUES
		('e0000000-0000-0000-0000-000000002026', 2026, 'Nadal 2026', 30.00, 'wishlists_open')
		ON CONFLICT (year) DO NOTHING;
	`
	if _, err := conn.Exec(seedEdition); err != nil {
		return err
	}

	// 2. Inserir o actualitzar l'Administrador
	seedAdmin := `
		INSERT INTO users (id, name, email, role) VALUES
		('a0000000-0000-0000-0000-000000000001', $1, LOWER($2), 'admin')
		ON CONFLICT (email) DO UPDATE SET role = 'admin', name = EXCLUDED.name;
	`
	if _, err := conn.Exec(seedAdmin, adminName, adminEmail); err != nil {
		return err
	}

	// 3. Vincular l'Administrador a l'edició activa
	seedAdminEdition := `
		INSERT INTO edition_members (edition_id, user_id, is_active)
		SELECT 'e0000000-0000-0000-0000-000000002026', id, true FROM users WHERE LOWER(email) = LOWER($1)
		ON CONFLICT DO NOTHING;
	`
	if _, err := conn.Exec(seedAdminEdition, adminEmail); err != nil {
		return err
	}

	fmt.Println("✅ Administrador inicial sincronitzat amb èxit!")
	return nil
}
