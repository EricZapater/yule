package draw_test

import (
	"testing"
	"yule/backend/internal/draw"
)

func sampleFamily() []draw.Participant {
	return []draw.Participant{
		{ID: "p1", Name: "Pau"},
		{ID: "p2", Name: "Mònica"},
		{ID: "p3", Name: "Jordi (Avi)"},
		{ID: "p4", Name: "Carme"},
		{ID: "p5", Name: "Marc"},
		{ID: "p6", Name: "Laia"},
	}
}

// TestEngine_Draw_Derangement valida que ningú es regala mai a si mateix en 1.000 sortejos consecutius.
func TestEngine_Draw_Derangement(t *testing.T) {
	family := sampleFamily()
	engine := draw.NewEngine()

	for i := 0; i < 1000; i++ {
		res, err := engine.Draw(family, nil)
		if err != nil {
			t.Fatalf("Iteració %d: error inesperat: %v", i, err)
		}

		if len(res) != len(family) {
			t.Fatalf("Iteració %d: esperava %d assignacions, n'he rebut %d", i, len(family), len(res))
		}

		for _, pair := range res {
			if pair.GiverID == pair.ReceiverID {
				t.Fatalf("ERROR CRÍTIC: Auto-assignació detectada a la iteració %d per al membre %s", i, pair.GiverID)
			}
		}
	}
}

// TestEngine_Draw_Incompatibilities valida que les regles d'exclusió es compleixen al 100% en 1.000 sortejos.
func TestEngine_Draw_Incompatibilities(t *testing.T) {
	family := sampleFamily()
	rules := []draw.IncompatibilityRule{
		// Parella Jordi <-> Mònica (mútua)
		{GiverID: "p3", ReceiverID: "p2"},
		{GiverID: "p2", ReceiverID: "p3"},
		// Exclusió unidireccional Pau -> Carme
		{GiverID: "p1", ReceiverID: "p4"},
	}

	engine := draw.NewEngine()

	for i := 0; i < 1000; i++ {
		res, err := engine.Draw(family, rules)
		if err != nil {
			t.Fatalf("Iteració %d: no ha trobat solució: %v", i, err)
		}

		for _, pair := range res {
			if pair.GiverID == pair.ReceiverID {
				t.Fatalf("Iteració %d: auto-assignació trobada per a %s", i, pair.GiverID)
			}

			// Validar Jordi -> Mònica
			if pair.GiverID == "p3" && pair.ReceiverID == "p2" {
				t.Fatalf("Iteració %d: violació de regla! Jordi ha estat assignat a regalar a Mònica", i)
			}
			// Validar Mònica -> Jordi
			if pair.GiverID == "p2" && pair.ReceiverID == "p3" {
				t.Fatalf("Iteració %d: violació de regla! Mònica ha estat assignada a regalar a Jordi", i)
			}
			// Validar Pau -> Carme
			if pair.GiverID == "p1" && pair.ReceiverID == "p4" {
				t.Fatalf("Iteració %d: violació de regla! Pau ha estat assignat a regalar a Carme", i)
			}
		}
	}
}

// TestEngine_Draw_Bijective comprova que cada participant regala exactament a 1 i rep exactament d'1.
func TestEngine_Draw_Bijective(t *testing.T) {
	family := sampleFamily()
	engine := draw.NewEngine()

	res, err := engine.Draw(family, nil)
	if err != nil {
		t.Fatalf("Error: %v", err)
	}

	giverCount := make(map[string]int)
	receiverCount := make(map[string]int)

	for _, pair := range res {
		giverCount[pair.GiverID]++
		receiverCount[pair.ReceiverID]++
	}

	for _, p := range family {
		if giverCount[p.ID] != 1 {
			t.Errorf("Membre %s té %d donacions (ha de ser exactament 1)", p.ID, giverCount[p.ID])
		}
		if receiverCount[p.ID] != 1 {
			t.Errorf("Membre %s rep %d regals (ha de ser exactament 1)", p.ID, receiverCount[p.ID])
		}
	}
}

// TestEngine_Draw_RandomnessDistribution comprova que les assignacions són diverses i no repetitives.
func TestEngine_Draw_RandomnessDistribution(t *testing.T) {
	family := sampleFamily()
	engine := draw.NewEngine()

	// Comptem quantes vegades p1 regala a cada altre membre en 500 sortejos
	counts := make(map[string]int)
	totalDraws := 500

	for i := 0; i < totalDraws; i++ {
		res, err := engine.Draw(family, nil)
		if err != nil {
			t.Fatalf("Error en sorteig: %v", err)
		}

		for _, pair := range res {
			if pair.GiverID == "p1" {
				counts[pair.ReceiverID]++
			}
		}
	}

	// Com que hi ha 5 possibles receptors (p2, p3, p4, p5, p6), cadascun hauria de rebre ~20% (100 cops)
	for _, p := range family {
		if p.ID == "p1" {
			continue
		}
		c := counts[p.ID]
		if c == 0 {
			t.Errorf("Distribució sospitosa: p1 mai ha regalat a %s en %d intents", p.ID, totalDraws)
		}
	}
}

// TestEngine_CheckViability_Deadlock valida que es detecta correctament un cas impossible.
func TestEngine_CheckViability_Deadlock(t *testing.T) {
	family := []draw.Participant{
		{ID: "p1", Name: "Pau"},
		{ID: "p2", Name: "Mònica"},
		{ID: "p3", Name: "Jordi"},
	}

	// Si Pau no pot regalar a Mònica ni a Jordi, Pau no té cap receptor possible
	impossibleRules := []draw.IncompatibilityRule{
		{GiverID: "p1", ReceiverID: "p2"},
		{GiverID: "p1", ReceiverID: "p3"},
	}

	engine := draw.NewEngine()
	viable, reason := engine.CheckViability(family, impossibleRules)

	if viable {
		t.Fatalf("S'esperava viable=false per a regles impossibles, però ha retornat true!")
	}
	if reason == "" {
		t.Fatalf("S'esperava un motiu d'inviabilitat explicatiu")
	}

	// I l'execució directa de Draw també ha de retornar error
	_, err := engine.Draw(family, impossibleRules)
	if err == nil {
		t.Fatalf("Draw hauria de retornar error quan és inviable!")
	}
}

// TestEngine_TooFewParticipants comprova que menys de 3 participants no es permet.
func TestEngine_TooFewParticipants(t *testing.T) {
	twoPeople := []draw.Participant{
		{ID: "p1", Name: "Pau"},
		{ID: "p2", Name: "Mònica"},
	}

	engine := draw.NewEngine()
	viable, _ := engine.CheckViability(twoPeople, nil)
	if viable {
		t.Errorf("2 persones no haurien de ser viables per a un amic invisible")
	}

	_, err := engine.Draw(twoPeople, nil)
	if err != draw.ErrTooFewParticipants {
		t.Errorf("Esperava ErrTooFewParticipants, obtingut: %v", err)
	}
}
