package member

import (
	"fmt"
	"os"
	"yule/backend/internal/edition"
)

type Service struct {
	repo           *Repository
	editionService *edition.Service
}

func NewService(repo *Repository, editionService *edition.Service) *Service {
	return &Service{
		repo:           repo,
		editionService: editionService,
	}
}

func (s *Service) ListMembers() ([]MemberAdminView, error) {
	currentEd, err := s.editionService.GetCurrentEdition()
	if err != nil {
		return nil, err
	}

	members, err := s.repo.ListMembersWithWishlistCount(currentEd.ID)
	if err != nil {
		return nil, err
	}

	baseURL := os.Getenv("APP_BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:5173"
	}

	for i := range members {
		token, err := s.repo.CreateQuickMagicToken(members[i].ID)
		if err == nil {
			members[i].MagicLinkURL = fmt.Sprintf("%s/login?token=%s", baseURL, token)
		}
	}

	return members, nil
}

func (s *Service) CreateMember(name, email string) (*MemberAdminView, error) {
	currentEd, err := s.editionService.GetCurrentEdition()
	if err != nil {
		return nil, err
	}

	userID, err := s.repo.CreateUser(name, email, "member")
	if err != nil {
		return nil, err
	}

	if err := s.repo.AttachToEdition(currentEd.ID, userID); err != nil {
		return nil, err
	}

	baseURL := os.Getenv("APP_BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:5173"
	}

	token, _ := s.repo.CreateQuickMagicToken(userID)
	magicURL := fmt.Sprintf("%s/login?token=%s", baseURL, token)

	return &MemberAdminView{
		ID:                 userID,
		Name:               name,
		Email:              email,
		Role:               "member",
		IsActive:           true,
		WishlistItemsCount: 0,
		MagicLinkURL:       magicURL,
	}, nil
}

func (s *Service) UpdateMember(userID string, input UpdateMemberInput) error {
	currentEd, err := s.editionService.GetCurrentEdition()
	if err != nil {
		return err
	}

	return s.repo.UpdateMember(currentEd.ID, userID, input.Name, input.Email, input.IsActive)
}

func (s *Service) DeleteMember(userID string) error {
	return s.repo.DeleteUser(userID)
}

func (s *Service) ClearMemberWishlist(userID string) error {
	currentEd, err := s.editionService.GetCurrentEdition()
	if err != nil {
		return err
	}
	return s.repo.ClearMemberWishlist(currentEd.ID, userID)
}

