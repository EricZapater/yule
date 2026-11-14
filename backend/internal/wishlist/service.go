package wishlist

import (
	"errors"
	"yule/backend/internal/edition"
)

var ErrItemNotFound = errors.New("article no trobat")

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

func (s *Service) GetMyWishlist(userID string) ([]WishlistItem, error) {
	currentEd, err := s.editionService.GetCurrentEdition()
	if err != nil {
		return nil, err
	}
	return s.repo.GetUserWishlist(currentEd.ID, userID)
}

func (s *Service) GetUserWishlist(editionID, userID string) ([]WishlistItem, error) {
	return s.repo.GetUserWishlist(editionID, userID)
}

func (s *Service) AddItem(userID string, req CreateWishlistItemRequest) (*WishlistItem, error) {
	currentEd, err := s.editionService.GetCurrentEdition()
	if err != nil {
		return nil, err
	}
	return s.repo.CreateItem(currentEd.ID, userID, req)
}

func (s *Service) UpdateItem(itemID, userID string, req CreateWishlistItemRequest) (*WishlistItem, error) {
	item, err := s.repo.UpdateItem(itemID, userID, req)
	if err != nil {
		return nil, err
	}
	if item == nil {
		return nil, ErrItemNotFound
	}
	return item, nil
}

func (s *Service) DeleteItem(itemID, userID string) error {
	return s.repo.DeleteItem(itemID, userID)
}
