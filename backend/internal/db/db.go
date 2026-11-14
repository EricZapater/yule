package db

import (
	"database/sql"
	"fmt"
	"log"
	"net/url"
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

				log.Printf("🔌 Connectant a PostgreSQL a %s:%s (bd: %s, usuari: %s)...", host, port, name, user)

				var userInfo *url.Userinfo
				if pass != "" {
					userInfo = url.UserPassword(user, pass)
				} else {
					userInfo = url.User(user)
				}

				u := &url.URL{
					Scheme:   "postgres",
					User:     userInfo,
					Host:     fmt.Sprintf("%s:%s", host, port),
					Path:     name,
					RawQuery: fmt.Sprintf("sslmode=%s", ssl),
				}
				dsn = u.String()
			} else {
				log.Println("🔌 Cap configuració trobada (ni DATABASE_URL ni DB_HOST); provant localhost:5432...")
				dsn = "postgres://postgres:postgres@localhost:5432/yule?sslmode=disable"
			}
		} else {
			log.Println("🔌 Connectant a PostgreSQL mitjançant DATABASE_URL...")
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
