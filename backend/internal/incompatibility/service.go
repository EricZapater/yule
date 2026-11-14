package incompatibility

import (
	"errors"
	"yule/backend/internal/draw"
	"yule/backend/internal/edition"
)

type Service struct {
	repo           *Repository
	editionService *edition.Service
	drawEngine     *draw.Engine
}

func NewService(repo *Repository, editionService *edition.Service, drawEngine *draw.Engine) *Service {
	return &Service{
		repo:           repo,
		editionService: editionService,
		drawEngine:     drawEngine,
	}
}

func (s *Service) ListIncompatibilities() ([]Incompatibility, error) {
	currentEd, err := s.editionService.GetCurrentEdition()
	if err != nil {
		return nil, err
	}
	return s.repo.ListIncompatibilities(currentEd.ID)
}

func (s *Service) CreateIncompatibility(input CreateIncompatibilityInput) (*Incompatibility, error) {
	if input.Person1ID == input.Person2ID {
		return nil, errors.New("una persona no pot ser incompatible amb ella mateixa")
	}

	currentEd, err := s.editionService.GetCurrentEdition()
	if err != nil {
		return nil, err
	}

	return s.repo.CreateIncompatibility(currentEd.ID, input.Person1ID, input.Person2ID, input.IsMutual, input.Notes)
}

func (s *Service) DeleteIncompatibility(id string) error {
	return s.repo.DeleteIncompatibility(id)
}

func (s *Service) CheckViability() (*ViabilityCheckResponse, error) {
	currentEd, err := s.editionService.GetCurrentEdition()
	if err != nil {
		return nil, err
	}

	participants, err := s.repo.GetActiveParticipants(currentEd.ID)
	if err != nil {
		return nil, err
	}

	incompList, err := s.repo.ListIncompatibilities(currentEd.ID)
	if err != nil {
		return nil, err
	}

	// Transformar regles per al motor
	var rules []draw.IncompatibilityRule
	for _, inc := range incompList {
		rules = append(rules, draw.IncompatibilityRule{
			GiverID:    inc.Person1.ID,
			ReceiverID: inc.Person2.ID,
		})
		if inc.IsMutual {
			rules = append(rules, draw.IncompatibilityRule{
				GiverID:    inc.Person2.ID,
				ReceiverID: inc.Person1.ID,
			})
		}
	}

	viable, reason := s.drawEngine.CheckViability(participants, rules)
	reasonPtr := &reason

	return &ViabilityCheckResponse{
		IsViable:          viable,
		ParticipantsCount: len(participants),
		ActiveRulesCount:  len(incompList),
		Reason:            reasonPtr,
	}, nil
}
