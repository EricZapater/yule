package draw

import (
	"errors"
	"math/rand"
	"time"
)

var (
	ErrTooFewParticipants   = errors.New("cal un mínim de 3 participants per fer el sorteig")
	ErrNoViableSolution     = errors.New("no hi ha cap solució possible que respecti totes les incompatibilitats")
	ErrUnsolvableConstraint = errors.New("un o més participants no tenen cap persona vàlida per regalar o rebre regal")
)

// Participant representa un membre que participa al sorteig.
type Participant struct {
	ID   string
	Name string
}

// IncompatibilityRule defineix que GiverID no pot regalar a ReceiverID.
type IncompatibilityRule struct {
	GiverID    string
	ReceiverID string
}

// AssignmentResult és el resultat d'una parella regalador -> receptor.
type AssignmentResult struct {
	GiverID    string
	ReceiverID string
}

// Engine gestiona l'algorisme de sorteig amb restriccions d'exclusió.
type Engine struct {
	rng *rand.Rand
}

// NewEngine crea una nova instància del motor amb la seva pròpia font de nombres aleatoris.
func NewEngine(seed ...int64) *Engine {
	var s int64
	if len(seed) > 0 {
		s = seed[0]
	} else {
		s = time.Now().UnixNano()
	}
	return &Engine{
		rng: rand.New(rand.NewSource(s)),
	}
}

// CheckViability comprova si existeix com a mínim una assignació vàlida que compleixi:
// 1. Cap participant s'assigna a si mateix.
// 2. Es respecten el 100% de les incompatibilitats.
// 3. Tothom dóna 1 regal i en rep 1.
func (e *Engine) CheckViability(participants []Participant, rules []IncompatibilityRule) (bool, string) {
	if len(participants) < 3 {
		return false, "Cal un mínim de 3 participants per a l'Amic Invisible"
	}

	// Construir matriu d'incompatibilitats per a lookup O(1)
	blocked := make(map[string]map[string]bool)
	for _, p := range participants {
		blocked[p.ID] = make(map[string]bool)
		blocked[p.ID][p.ID] = true // Ningú pot regalar-se a si mateix
	}
	for _, r := range rules {
		if _, ok := blocked[r.GiverID]; ok {
			blocked[r.GiverID][r.ReceiverID] = true
		}
	}

	// Comprovació ràpida de graus (cada participant ha de tenir >= 1 opció de sortida i >= 1 d'entrada)
	inDegree := make(map[string]int)
	for _, p1 := range participants {
		outDegree := 0
		for _, p2 := range participants {
			if !blocked[p1.ID][p2.ID] {
				outDegree++
				inDegree[p2.ID]++
			}
		}
		if outDegree == 0 {
			return false, "En/na " + p1.Name + " no pot regalar a ningú amb les incompatibilitats actuals"
		}
	}

	for _, p := range participants {
		if inDegree[p.ID] == 0 {
			return false, "En/na " + p.Name + " no pot rebre cap regal de ningú amb les incompatibilitats actuals"
		}
	}

	// Intentar trobar una solució amb backtracking ràpid
	assignedGivers := make([]string, len(participants))
	for i, p := range participants {
		assignedGivers[i] = p.ID
	}
	usedReceivers := make(map[string]bool)
	assignment := make(map[string]string)

	if solve(0, assignedGivers, participants, blocked, usedReceivers, assignment) {
		return true, "Tots els participants tenen combinacions vàlides garantides"
	}

	return false, "Les incompatibilitats actuals fan matemàticament impossible completar el cercle d'assignacions"
}

// Draw genera una assignació aleatòria vàlida i uniforme.
func (e *Engine) Draw(participants []Participant, rules []IncompatibilityRule) ([]AssignmentResult, error) {
	if len(participants) < 3 {
		return nil, ErrTooFewParticipants
	}

	// Matriu de bloquejos
	blocked := make(map[string]map[string]bool)
	for _, p := range participants {
		blocked[p.ID] = make(map[string]bool)
		blocked[p.ID][p.ID] = true
	}
	for _, r := range rules {
		if _, ok := blocked[r.GiverID]; ok {
			blocked[r.GiverID][r.ReceiverID] = true
		}
	}

	// Farem diversos intents aleatoris per garantir màxima uniformitat
	const maxAttempts = 100
	for attempt := 0; attempt < maxAttempts; attempt++ {
		// Barregem els donants
		givers := make([]string, len(participants))
		for i, p := range participants {
			givers[i] = p.ID
		}
		e.rng.Shuffle(len(givers), func(i, j int) {
			givers[i], givers[j] = givers[j], givers[i]
		})

		// Llista de receptors barrejats
		receivers := make([]string, len(participants))
		for i, p := range participants {
			receivers[i] = p.ID
		}
		e.rng.Shuffle(len(receivers), func(i, j int) {
			receivers[i], receivers[j] = receivers[j], receivers[i]
		})

		usedReceivers := make(map[string]bool)
		assignment := make(map[string]string)

		if e.solveRandom(0, givers, receivers, blocked, usedReceivers, assignment) {
			results := make([]AssignmentResult, 0, len(assignment))
			for giverID, receiverID := range assignment {
				results = append(results, AssignmentResult{
					GiverID:    giverID,
					ReceiverID: receiverID,
				})
			}
			return results, nil
		}
	}

	// Si després d'intents aleatoris no troba solució, comprovem viabilitat
	viable, _ := e.CheckViability(participants, rules)
	if !viable {
		return nil, ErrNoViableSolution
	}

	// Si és viable però els intents aleatoris van fallar, usem backtracking determinista
	givers := make([]string, len(participants))
	for i, p := range participants {
		givers[i] = p.ID
	}
	usedReceivers := make(map[string]bool)
	assignment := make(map[string]string)
	if solve(0, givers, participants, blocked, usedReceivers, assignment) {
		results := make([]AssignmentResult, 0, len(assignment))
		for giverID, receiverID := range assignment {
			results = append(results, AssignmentResult{
				GiverID:    giverID,
				ReceiverID: receiverID,
			})
		}
		return results, nil
	}

	return nil, ErrNoViableSolution
}

func (e *Engine) solveRandom(
	giverIdx int,
	givers []string,
	receivers []string,
	blocked map[string]map[string]bool,
	usedReceivers map[string]bool,
	assignment map[string]string,
) bool {
	if giverIdx == len(givers) {
		return true
	}

	giverID := givers[giverIdx]

	// Creem una còpia barrejada dels receptors potencials
	candidateReceivers := make([]string, 0, len(receivers))
	for _, recID := range receivers {
		if !usedReceivers[recID] && !blocked[giverID][recID] {
			candidateReceivers = append(candidateReceivers, recID)
		}
	}

	e.rng.Shuffle(len(candidateReceivers), func(i, j int) {
		candidateReceivers[i], candidateReceivers[j] = candidateReceivers[j], candidateReceivers[i]
	})

	for _, receiverID := range candidateReceivers {
		usedReceivers[receiverID] = true
		assignment[giverID] = receiverID

		if e.solveRandom(giverIdx+1, givers, receivers, blocked, usedReceivers, assignment) {
			return true
		}

		delete(assignment, giverID)
		usedReceivers[receiverID] = false
	}

	return false
}

func solve(
	giverIdx int,
	givers []string,
	participants []Participant,
	blocked map[string]map[string]bool,
	usedReceivers map[string]bool,
	assignment map[string]string,
) bool {
	if giverIdx == len(givers) {
		return true
	}

	giverID := givers[giverIdx]
	for _, p := range participants {
		recID := p.ID
		if !usedReceivers[recID] && !blocked[giverID][recID] {
			usedReceivers[recID] = true
			assignment[giverID] = recID

			if solve(giverIdx+1, givers, participants, blocked, usedReceivers, assignment) {
				return true
			}

			delete(assignment, giverID)
			usedReceivers[recID] = false
		}
	}

	return false
}
