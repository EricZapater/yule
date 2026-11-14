package db

import (
	"database/sql"
	"fmt"
	"log"
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

	adminEmail := os.Getenv("ADMIN_EMAIL")
	if adminEmail == "" {
		log.Println("ℹ️ Cap ADMIN_EMAIL configurat a .env.backend. El primer usuari que es registri serà administrador automàticament.")
		return nil
	}

	adminName := os.Getenv("ADMIN_NAME")
	if adminName == "" {
		adminName = "Administrador"
	}

	log.Printf("👑 Sincronitzant usuari administrador (%s <%s>)...", adminName, adminEmail)

	// 2. Netejar usuaris de prova anteriors si no tenen contingut
	_, _ = conn.Exec(`DELETE FROM users WHERE (email LIKE '%@familia.cat' OR email = 'eric@zapater.cat') AND LOWER(email) <> LOWER($1) AND id NOT IN (SELECT user_id FROM wishlist_items)`, adminEmail)

	// 3. Inserir o actualitzar l'Administrador definit a l'entorn
	seedAdmin := `
		INSERT INTO users (id, name, email, role) VALUES
		('a0000000-0000-0000-0000-000000000001', $1, LOWER($2), 'admin')
		ON CONFLICT (email) DO UPDATE SET role = 'admin', name = EXCLUDED.name;
	`
	if _, err := conn.Exec(seedAdmin, adminName, adminEmail); err != nil {
		return err
	}

	// 4. Vincular l'Administrador a l'edició activa
	seedAdminEdition := `
		INSERT INTO edition_members (edition_id, user_id, is_active)
		SELECT 'e0000000-0000-0000-0000-000000002026', id, true FROM users WHERE LOWER(email) = LOWER($1)
		ON CONFLICT DO NOTHING;
	`
	if _, err := conn.Exec(seedAdminEdition, adminEmail); err != nil {
		return err
	}

	log.Println("✅ Administrador inicial sincronitzat amb èxit!")
	return nil
}
