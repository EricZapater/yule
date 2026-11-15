package draw

import (
	"errors"
	"log"
	"os"
	"yule/backend/internal/edition"
	"yule/backend/internal/mailer"
	"yule/backend/internal/wishlist"
)

var (
	ErrDrawNotReady = errors.New("el sorteig d'aquesta edició encara no s'ha realitzat")
)

type Mailer interface {
	SendDrawNotification(toEmail, giverName, receiverName, editionName string, budgetLimit float64, appURL string, items []mailer.EmailWishlistItem) error
	IsConfigured() bool
}

type Service struct {
	repo           *Repository
	editionService *edition.Service
	engine         *Engine
	mailer         Mailer
}

func NewService(repo *Repository, editionService *edition.Service, engine *Engine, mailer Mailer) *Service {
	return &Service{
		repo:           repo,
		editionService: editionService,
		engine:         engine,
		mailer:         mailer,
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

	// Enviem les notificacions per correu a cadascun
	dispatched := s.dispatchNotifications(currentEd, participants, emails, results)

	return &DrawExecutionResponse{
		Status:            "drawn",
		DrawnAt:           drawnAt,
		ParticipantsCount: len(participants),
		EmailsDispatched:  dispatched,
	}, nil
}

// NotifyAssignments envia o reenvia els correus del sorteig actual sense refer les parelles.
func (s *Service) NotifyAssignments() (int, error) {
	currentEd, err := s.editionService.GetCurrentEdition()
	if err != nil {
		return 0, err
	}

	if currentEd.Status != "drawn" {
		return 0, ErrDrawNotReady
	}

	assignments, err := s.repo.GetEditionAssignments(currentEd.ID)
	if err != nil {
		return 0, err
	}

	participants, emails, err := s.repo.GetActiveParticipantsWithEmail(currentEd.ID)
	if err != nil {
		return 0, err
	}

	dispatched := s.dispatchNotifications(currentEd, participants, emails, assignments)
	return dispatched, nil
}

func (s *Service) dispatchNotifications(currentEd *edition.Edition, participants []Participant, emails map[string]string, pairs []AssignmentResult) int {
	nameByID := make(map[string]string)
	for _, p := range participants {
		nameByID[p.ID] = p.Name
	}

	baseURL := os.Getenv("APP_BASE_URL")
	if baseURL == "" {
		baseURL = "https://yule.ericzapater.cat"
	}

	wishlists, err := s.repo.GetEditionWishlists(currentEd.ID)
	if err != nil {
		log.Printf("⚠️ No s'han pogut carregar les llistes de desitjos per als correus: %v", err)
		wishlists = make(map[string][]wishlist.WishlistItem)
	}

	log.Printf("\n📨 [NOTIFICACIONS SORTEIG] Edició %s celebrada amb èxit (%d participants):", currentEd.Name, len(pairs))
	dispatched := 0
	for _, pair := range pairs {
		giverName := nameByID[pair.GiverID]
		giverEmail := emails[pair.GiverID]
		receiverName := nameByID[pair.ReceiverID]

		receiverWishes := wishlists[pair.ReceiverID]
		var emailWishes []mailer.EmailWishlistItem
		for _, w := range receiverWishes {
			emailWishes = append(emailWishes, mailer.EmailWishlistItem{
				Title:          w.Title,
				PriceEstimated: w.PriceEstimated,
				URL:            w.URL,
				ImageURL:       w.ImageURL,
				Notes:          w.Notes,
			})
		}

		log.Printf("  • A %s (%s): T'ha tocat fer el regal a %s! 🎁 (Té %d desitjos a la llista)", giverName, giverEmail, receiverName, len(emailWishes))

		if s.mailer != nil && s.mailer.IsConfigured() && giverEmail != "" {
			dispatched++
			go func(toEmail, gName, rName string, wishes []mailer.EmailWishlistItem) {
				log.Printf("🚀 Enviant correu de sorteig a %s (%s) amb %d desitjos...", gName, toEmail, len(wishes))
				if err := s.mailer.SendDrawNotification(toEmail, gName, rName, currentEd.Name, currentEd.BudgetLimit, baseURL, wishes); err != nil {
					log.Printf("❌ ERROR enviant correu de sorteig a %s: %v", toEmail, err)
				} else {
					log.Printf("✅ Correu de sorteig enviat amb èxit a %s", toEmail)
				}
			}(giverEmail, giverName, receiverName, emailWishes)
		} else {
			if s.mailer == nil || !s.mailer.IsConfigured() {
				log.Printf("ℹ️ [SENSE SMTP] El servidor no té SMTP configurat. El correu per a %s no s'ha enviat.", giverEmail)
			}
		}
	}
	return dispatched
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

// ResetDraw elimina els resultats del sorteig actiu i torna a obrir les llistes de desitjos.
func (s *Service) ResetDraw() error {
	currentEd, err := s.editionService.GetCurrentEdition()
	if err != nil {
		return err
	}
	return s.repo.ResetAssignmentsTransactional(currentEd.ID)
}

