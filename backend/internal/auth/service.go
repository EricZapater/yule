package auth

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"log"
	"os"
	"strings"
	"time"
	"yule/backend/internal/shared"

	"github.com/google/uuid"
)

var (
	ErrUserNotFound = errors.New("aquest correu no està registrat a la família")
	ErrTokenInvalid = errors.New("enllaç màgic invàlid o caducat")
)

type Mailer interface {
	SendMagicLink(toEmail, toName, magicLinkURL string) error
	IsConfigured() bool
}

type Service struct {
	repo   *Repository
	mailer Mailer
}

func NewService(repo *Repository, mailer Mailer) *Service {
	return &Service{repo: repo, mailer: mailer}
}

// RequestMagicLink genera un token d'un sol ús i simula/envia el correu.
func (s *Service) RequestMagicLink(rawEmail string) (string, error) {
	email := strings.ToLower(strings.TrimSpace(rawEmail))
	log.Printf("📩 Sol·licitud de Magic Link per a: '%s'", email)

	user, err := s.repo.FindUserByEmail(email)
	if err != nil {
		log.Printf("❌ Error cercant usuari '%s': %v", email, err)
		return "", err
	}

	// Si l'usuari no existeix encara a la base de dades:
	if user == nil {
		adminEnvEmail := strings.ToLower(strings.TrimSpace(os.Getenv("ADMIN_EMAIL")))
		count, _ := s.repo.CountUsers()
		log.Printf("ℹ️ Usuari '%s' no trobat. (ADMIN_EMAIL configurat='%s', total_usuaris=%d)", email, adminEnvEmail, count)

		// Cas 1: L'email és el de l'ADMIN_EMAIL configurat a l'entorn
		// Cas 2: És el primer usuari que intenta entrar al sistema
		if (adminEnvEmail != "" && email == adminEnvEmail) || count == 0 {
			adminName := strings.TrimSpace(os.Getenv("ADMIN_NAME"))
			if adminName == "" {
				adminName = "Administrador"
			}
			newID := uuid.New().String()
			user, err = s.repo.CreateUser(newID, adminName, email, "admin")
			if err != nil {
				log.Printf("❌ Error creant usuari admin automàtic: %v", err)
				return "", fmt.Errorf("error creant usuari admin automàtic: %w", err)
			}
			editionID, _ := s.repo.GetActiveEditionID()
			if editionID != "" {
				_ = s.repo.AttachToEdition(editionID, user.ID)
			}
			log.Printf("👑 Usuari administrador creat automàticament (%s <%s>)", adminName, email)
		} else {
			return "", ErrUserNotFound
		}
	} else {
		log.Printf("👤 Usuari trobat: id=%s, nom=%s, rol=%s", user.ID, user.Name, user.Role)
	}

	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	token := hex.EncodeToString(bytes)
	expiresAt := time.Now().Add(24 * time.Hour)

	linkID := uuid.New().String()
	if err := s.repo.CreateMagicLink(linkID, user.ID, token, expiresAt); err != nil {
		log.Printf("❌ Error guardant Magic Link a la BD: %v", err)
		return "", err
	}

	baseURL := os.Getenv("APP_BASE_URL")
	if baseURL == "" {
		baseURL = "https://yule.ericzapater.cat"
	}

	magicURL := fmt.Sprintf("%s/login?token=%s", baseURL, token)
	log.Printf("📧 [CORREU YULE] Enllaç màgic per a %s (%s): %s", user.Name, user.Email, magicURL)

	if s.mailer != nil && s.mailer.IsConfigured() {
		log.Printf("🚀 Intentant enviar correu SMTP a %s...", user.Email)
		if err := s.mailer.SendMagicLink(user.Email, user.Name, magicURL); err != nil {
			log.Printf("❌ ERROR enviant correu SMTP a %s: %v", user.Email, err)
		} else {
			log.Printf("✅ Correu lliurat amb èxit al servidor SMTP per a %s", user.Email)
		}
	} else {
		log.Printf("ℹ️ [SENSE SMTP] El contenidor no té SMTP_HOST configurat a l'entorn. Utilitza l'enllaç superior.")
	}

	return token, nil
}

// VerifyMagicLink valida el token i retorna el JWT de sessió persistent.
func (s *Service) VerifyMagicLink(token string) (*AuthSessionResponse, error) {
	link, err := s.repo.FindValidMagicLink(token)
	if err != nil {
		return nil, err
	}
	if link == nil {
		return nil, ErrTokenInvalid
	}

	user, err := s.repo.FindUserByID(link.UserID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUserNotFound
	}

	if err := s.repo.MarkMagicLinkUsed(link.ID); err != nil {
		return nil, err
	}

	jwtToken, err := shared.GenerateJWT(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, err
	}

	return &AuthSessionResponse{
		Token: jwtToken,
		User:  *user,
	}, nil
}

// Register registra un nou membre (o recupera l'existent) i el connecta directament a l'edició activa.
func (s *Service) Register(name, email string) (*AuthSessionResponse, error) {
	name = strings.TrimSpace(name)
	email = strings.ToLower(strings.TrimSpace(email))
	if name == "" || email == "" {
		return nil, errors.New("cal indicar el nom i el correu electrònic")
	}

	log.Printf("📝 Intent de registre de membre: '%s' <%s>", name, email)

	user, err := s.repo.FindUserByEmail(email)
	if err != nil {
		log.Printf("❌ Error cercant usuari existent per email '%s': %v", email, err)
		return nil, fmt.Errorf("error cercant usuari existent: %w", err)
	}

	if user == nil {
		role := "member"
		count, err := s.repo.CountUsers()
		if err != nil {
			log.Printf("⚠️ Error comptant usuaris: %v", err)
		}
		if count == 0 {
			role = "admin" // El primer familiar que es registra és automàticament l'administrador
		}
		newID := uuid.New().String()
		log.Printf("👤 Creant nou usuari '%s' <%s> (rol: %s, id: %s)...", name, email, role, newID)
		user, err = s.repo.CreateUser(newID, name, email, role)
		if err != nil {
			log.Printf("❌ Error creant usuari a la BD: %v", err)
			return nil, fmt.Errorf("error creant usuari a la base de dades: %w", err)
		}
	} else {
		log.Printf("👤 Usuari existent trobat: id=%s, nom=%s, rol=%s", user.ID, user.Name, user.Role)
		if name != "" && user.Name != name {
			_ = s.repo.UpdateUserName(user.ID, name)
			user.Name = name
		}
	}

	// Associar a l'edició activa
	editionID, err := s.repo.GetActiveEditionID()
	if err != nil {
		log.Printf("⚠️ No s'ha trobat cap edició activa per associar el membre: %v", err)
	} else if editionID != "" {
		if err := s.repo.AttachToEdition(editionID, user.ID); err != nil {
			log.Printf("⚠️ Error associant usuari %s a l'edició %s: %v", user.ID, editionID, err)
		} else {
			log.Printf("🔗 Usuari %s vinculat a l'edició %s", user.ID, editionID)
		}
	}

	jwtToken, err := shared.GenerateJWT(user.ID, user.Email, user.Role)
	if err != nil {
		log.Printf("❌ Error generant JWT per a %s: %v", user.ID, err)
		return nil, fmt.Errorf("error generant sessió: %w", err)
	}

	return &AuthSessionResponse{
		Token: jwtToken,
		User:  *user,
	}, nil
}

// GetUserByID retorna l'usuari a partir del seu identificador.
func (s *Service) GetUserByID(id string) (*User, error) {
	return s.repo.FindUserByID(id)
}
