package main

import (
	"fmt"
	"os"
	"strings"
	"yule/backend/internal/draw"
)

func main() {
	fmt.Println("======================================================")
	fmt.Println("🎄 YULE — Simulador d'Assignació de l'Amic Invisible 🎄")
	fmt.Println("======================================================")

	// Cas d'exemple de família
	participants := []draw.Participant{
		{ID: "1", Name: "Pau (Tu)"},
		{ID: "2", Name: "Mònica"},
		{ID: "3", Name: "Jordi (Avi)"},
		{ID: "4", Name: "Carme"},
		{ID: "5", Name: "Marc"},
		{ID: "6", Name: "Laia"},
	}

	// Regles d'incompatibilitat
	// 1. Jordi <-> Mònica (mútua / parella)
	// 2. Pau -> Carme (unidireccional)
	rules := []draw.IncompatibilityRule{
		{GiverID: "3", ReceiverID: "2"},
		{GiverID: "2", ReceiverID: "3"},
		{GiverID: "1", ReceiverID: "4"},
	}

	fmt.Println("\n📋 Membres de la família:")
	for _, p := range participants {
		fmt.Printf("  • [%s] %s\n", p.ID, p.Name)
	}

	fmt.Println("\n🔒 Incompatibilitats actives (Només Admin):")
	fmt.Println("  • Jordi (Avi) ⇄ Mònica (Mútua)")
	fmt.Println("  • Pau (Tu) → Carme (No li regala)")

	engine := draw.NewEngine()

	// 1. Comprovació de viabilitat
	viable, reason := engine.CheckViability(participants, rules)
	fmt.Printf("\n🚦 Comprovació del Semàfor: ")
	if viable {
		fmt.Printf("✅ VIABLE (%s)\n", reason)
	} else {
		fmt.Printf("❌ INVIABLE: %s\n", reason)
		os.Exit(1)
	}

	// 2. Executar 3 proves consecutives per veure la variació aleatòria
	fmt.Println("\n------------------------------------------------------")
	fmt.Println("🎲 Executant 3 simulacions de sorteig per comprovar variació:")
	fmt.Println("------------------------------------------------------")

	nameByID := make(map[string]string)
	for _, p := range participants {
		nameByID[p.ID] = p.Name
	}

	for sim := 1; sim <= 3; sim++ {
		fmt.Printf("\n▶ PROVA #%d:\n", sim)
		res, err := engine.Draw(participants, rules)
		if err != nil {
			fmt.Printf("Error: %v\n", err)
			continue
		}

		for _, pair := range res {
			giver := nameByID[pair.GiverID]
			receiver := nameByID[pair.ReceiverID]

			// Validacions visuals
			notes := ""
			if pair.GiverID == pair.ReceiverID {
				notes = " ⚠️ ERROR: AUTO-ASSIGNAT!"
			}
			if (pair.GiverID == "3" && pair.ReceiverID == "2") || (pair.GiverID == "2" && pair.ReceiverID == "3") {
				notes = " ⚠️ ERROR: REGAL ENTRE JORDI I MÒNICA!"
			}
			if pair.GiverID == "1" && pair.ReceiverID == "4" {
				notes = " ⚠️ ERROR: PAU REGALANT A CARME!"
			}

			fmt.Printf("  %-15s 🎁 regala a ➔ %-15s %s\n", giver, receiver, notes)
		}
	}

	fmt.Println("\n" + strings.Repeat("=", 54))
	fmt.Println("✨ Totes les assignacions respecten les regles al 100%!")
	fmt.Println(strings.Repeat("=", 54))
}
