package draw

import (
	"errors"
	"fmt"
	"yule/backend/internal/edition"
)

var (
	ErrDrawNotReady = errors.New("el sorteig d'aquesta edició encara no s'ha realitzat")
)

type Service struct {
	repo           *Repository
	editionService *edition.Service
	engine         *Engine
}

func NewService(repo *Repository, editionService *edition.Service, engine *Engine) *Service {
	return &Service{
		repo:           repo,
		editionService: editionService,
		engine:         engine,
	}
}

// ExecuteDraw executa el sorteig automàtic, desa les parelles a la BBDD i envia correus.
func (s *Service) ExecuteDraw() (*DrawExecutionResponse, error) {
	currentEd, err := s.editionService.GetCurrentEdition()
	if err != nil {
		return nil, err
	}

	participants, emails, err := s.repo.GetActiveParticipantsWithEmail(currentEd.ID)
	if err != nil {
		return nil, err
	}

	if len(participants) < 3 {
		return nil, ErrTooFewParticipants
	}

	rules, err := s.repo.GetIncompatibilityRules(currentEd.ID)
	if err != nil {
		return nil, err
	}

	// Executar el motor de sorteig
	results, err := s.engine.Draw(participants, rules)
	if err != nil {
		return nil, err
	}

	// Desem el resultat en una transacció
	drawnAt, err := s.repo.SaveAssignmentsTransactional(currentEd.ID, results)
	if err != nil {
		return nil, err
	}

	nameByID := make(map[string]string)
	for _, p := range participants {
		nameByID[p.ID] = p.Name
	}

	// Simulem l'enviament de correus per consola per a cadascun
	fmt.Printf("\n📨 [NOTIFICACIONS SORTEIG] Edició %s celebrada amb èxit:\n", currentEd.Name)
	for _, pair := range results {
		giverName := nameByID[pair.GiverID]
		giverEmail := emails[pair.GiverID]
		receiverName := nameByID[pair.ReceiverID]
		fmt.Printf("  • A %s (%s): T'ha tocat fer el regal a %s! 🎁\n", giverName, giverEmail, receiverName)
	}

	return &DrawExecutionResponse{
		Status:            "drawn",
		DrawnAt:           drawnAt,
		ParticipantsCount: len(participants),
		EmailsDispatched:  len(results),
	}, nil
}

// GetMyAssignment retorna el destinatari secret i la seva llista de desitjos per a l'usuari connectat.
func (s *Service) GetMyAssignment(userID string) (*AssignmentResponse, error) {
	currentEd, err := s.editionService.GetCurrentEdition()
	if err != nil {
		return nil, err
	}

	recipient, wishlist, err := s.repo.GetMyAssignment(currentEd.ID, userID)
	if err != nil {
		return nil, err
	}
	if recipient == nil {
		return nil, ErrDrawNotReady
	}

	if wishlist == nil {
		wishlist = []AssignedWishlistItem{}
	}

	return &AssignmentResponse{
		Recipient:   *recipient,
		BudgetLimit: currentEd.BudgetLimit,
		Wishlist:    wishlist,
	}, nil
}

// MarkItemPurchased actualitza si el regalador ha marcat un article com a comprat/pensat.
func (s *Service) MarkItemPurchased(userID, itemID string, isPurchased bool) error {
	return s.repo.MarkItemPurchased(userID, itemID, isPurchased)
}
