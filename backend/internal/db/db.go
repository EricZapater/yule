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
			dsn = "postgres://postgres:postgres@localhost:5432/yule?sslmode=disable"
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
