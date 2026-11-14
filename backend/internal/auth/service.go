package auth

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
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

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

// RequestMagicLink genera un token d'un sol ús i simula/envia el correu.
func (s *Service) RequestMagicLink(rawEmail string) (string, error) {
	email := strings.ToLower(strings.TrimSpace(rawEmail))
	user, err := s.repo.FindUserByEmail(email)
	if err != nil {
		return "", err
	}

	// Si l'usuari no existeix encara a la base de dades:
	if user == nil {
		adminEnvEmail := strings.ToLower(strings.TrimSpace(os.Getenv("ADMIN_EMAIL")))
		count, _ := s.repo.CountUsers()

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
				return "", fmt.Errorf("error creant usuari admin automàtic: %w", err)
			}
			editionID, _ := s.repo.GetActiveEditionID()
			if editionID != "" {
				_ = s.repo.AttachToEdition(editionID, user.ID)
			}
			fmt.Printf("👑 Usuari administrador creat automàticament per accés inicial (%s <%s>)\n", adminName, email)
		} else {
			return "", ErrUserNotFound
		}
	}

	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	token := hex.EncodeToString(bytes)
	expiresAt := time.Now().Add(24 * time.Hour)

	linkID := uuid.New().String()
	if err := s.repo.CreateMagicLink(linkID, user.ID, token, expiresAt); err != nil {
		return "", err
	}

	baseURL := os.Getenv("APP_BASE_URL")
	if baseURL == "" {
		baseURL = "https://yule.ericzapater.cat"
	}

	fmt.Printf("📧 [CORREU YULE] Enllaç màgic per a %s: %s/login?token=%s\n", user.Email, baseURL, token)

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
	if name == "" || email == "" {
		return nil, errors.New("cal indicar el nom i el correu electrònic")
	}

	user, err := s.repo.FindUserByEmail(email)
	if err != nil {
		return nil, err
	}

	if user == nil {
		role := "member"
		count, _ := s.repo.CountUsers()
		if count == 0 {
			role = "admin" // El primer familiar que es registra és automàticament l'administrador
		}
		newID := uuid.New().String()
		user, err = s.repo.CreateUser(newID, name, email, role)
		if err != nil {
			return nil, err
		}
	}

	// Associar a l'edició activa
	editionID, err := s.repo.GetActiveEditionID()
	if err == nil && editionID != "" {
		_ = s.repo.AttachToEdition(editionID, user.ID)
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

// GetUserByID retorna l'usuari a partir del seu identificador.
func (s *Service) GetUserByID(id string) (*User, error) {
	return s.repo.FindUserByID(id)
}
