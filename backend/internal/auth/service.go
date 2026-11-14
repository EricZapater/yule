package auth

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"time"
	"yule/backend/internal/shared"

	"github.com/google/uuid"
)

var (
	ErrUserNotFound    = errors.New("aquest correu no està registrat a la família")
	ErrTokenInvalid    = errors.New("enllaç màgic invàlid o caducat")
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

// RequestMagicLink genera un token d'un sol ús i simula/envia el correu.
func (s *Service) RequestMagicLink(email string) (string, error) {
	user, err := s.repo.FindUserByEmail(email)
	if err != nil {
		return "", err
	}
	if user == nil {
		return "", ErrUserNotFound
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

	// En un entorn real aquí s'envia el correu per SMTP
	fmt.Printf("📧 [CORREU YULE] Enllaç màgic per a %s: http://localhost:5173/login?token=%s\n", user.Email, token)

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

// GetUserByID retorna l'usuari a partir del seu identificador.
func (s *Service) GetUserByID(id string) (*User, error) {
	return s.repo.FindUserByID(id)
}
