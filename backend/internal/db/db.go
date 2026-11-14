package db

import (
	"database/sql"
	"fmt"
	"os"
	"time"

	_ "github.com/lib/pq"
)

// Connect estableix la connexió amb PostgreSQL i configura el connection pool.
func Connect(dsn string) (*sql.DB, error) {
	if dsn == "" {
		dsn = os.Getenv("DATABASE_URL")
		if dsn == "" {
			host := os.Getenv("DB_HOST")
			if host != "" {
				port := os.Getenv("DB_PORT")
				if port == "" {
					port = "5432"
				}
				user := os.Getenv("DB_USER")
				if user == "" {
					user = "postgres"
				}
				pass := os.Getenv("DB_PASSWORD")
				name := os.Getenv("DB_NAME")
				if name == "" {
					name = "yule"
				}
				ssl := os.Getenv("DB_SSLMODE")
				if ssl == "" {
					ssl = "disable"
				}
				dsn = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s", user, pass, host, port, name, ssl)
			} else {
				dsn = "postgres://postgres:postgres@localhost:5432/yule?sslmode=disable"
			}
		}
	}

	conn, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("error obrint connexió postgres: %w", err)
	}

	conn.SetMaxOpenConns(25)
	conn.SetMaxIdleConns(10)
	conn.SetConnMaxLifetime(15 * time.Minute)

	if err := conn.Ping(); err != nil {
		return nil, fmt.Errorf("error fent ping a postgres: %w", err)
	}

	return conn, nil
}
