package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"yule/backend/internal/auth"
	"yule/backend/internal/db"
	"yule/backend/internal/draw"
	"yule/backend/internal/edition"
	"yule/backend/internal/incompatibility"
	"yule/backend/internal/member"
	"yule/backend/internal/shared"
	"yule/backend/internal/upload"
	"yule/backend/internal/wishlist"

	"github.com/gin-gonic/gin"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgres://postgres:postgres@localhost:5432/yule?sslmode=disable"
	}

	conn, err := db.Connect(databaseURL)
	if err != nil {
		log.Printf("⚠️ Avís: No s'ha pogut connectar a PostgreSQL (%v).", err)
		log.Printf("💡 Pots engegar postgres amb Docker: docker run --name yule-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=yule -p 5432:5432 -d postgres:16-alpine")
	} else {
		log.Println("✅ Connexió establerta amb PostgreSQL.")
		// Executar automigració
		migrationPath := filepath.Join("internal", "db", "migrations", "000001_init_schema.up.sql")
		if err := db.AutoMigrate(conn, migrationPath); err != nil {
			log.Printf("⚠️ Error aplicant migració: %v", err)
		} else {
			log.Println("✅ Esquema de base de dades sincronitzat.")
			_ = db.SeedInitialData(conn)
		}
	}

	// Instanciació de serveis i repositoris
	drawEngine := draw.NewEngine()

	authRepo := auth.NewRepository(conn)
	authService := auth.NewService(authRepo)
	authHandler := auth.NewHandler(authService)

	editionRepo := edition.NewRepository(conn)
	editionService := edition.NewService(editionRepo)
	editionHandler := edition.NewHandler(editionService)

	memberRepo := member.NewRepository(conn)
	memberService := member.NewService(memberRepo, editionService)
	memberHandler := member.NewHandler(memberService)

	wishlistRepo := wishlist.NewRepository(conn)
	wishlistService := wishlist.NewService(wishlistRepo, editionService)
	wishlistHandler := wishlist.NewHandler(wishlistService)

	incompRepo := incompatibility.NewRepository(conn)
	incompService := incompatibility.NewService(incompRepo, editionService, drawEngine)
	incompHandler := incompatibility.NewHandler(incompService)

	drawRepo := draw.NewRepository(conn)
	drawService := draw.NewService(drawRepo, editionService, drawEngine)
	drawHandler := draw.NewHandler(drawService)

	uploadDir := filepath.Join(".", "uploads", "photos")
	uploadHandler := upload.NewHandler(uploadDir)

	router := gin.Default()
	router.Use(shared.CORSMiddleware())

	// Fitxers estàtics per fotos
	router.Static("/uploads/photos", uploadDir)

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "app": "yule-backend"})
	})

	api := router.Group("/api/v1")
	{
		// Rutes públiques
		api.POST("/auth/magic-link", authHandler.RequestMagicLink)
		api.POST("/auth/verify", authHandler.VerifyMagicLink)

		// Rutes autenticades per a qualsevol membre
		authGroup := api.Group("")
		authGroup.Use(shared.AuthMiddleware())
		{
			authGroup.GET("/auth/me", authHandler.GetMe)
			authGroup.GET("/editions/current", editionHandler.GetCurrentEdition)

			authGroup.GET("/wishlist", wishlistHandler.GetMyWishlist)
			authGroup.POST("/wishlist", wishlistHandler.AddWishlistItem)
			authGroup.PUT("/wishlist/:item_id", wishlistHandler.UpdateWishlistItem)
			authGroup.DELETE("/wishlist/:item_id", wishlistHandler.DeleteWishlistItem)

			authGroup.POST("/upload", uploadHandler.UploadPhoto)

			authGroup.GET("/assignment", drawHandler.GetMyAssignment)
			authGroup.POST("/assignment/items/:item_id/mark-purchased", drawHandler.MarkItemPurchased)

			// Rutes d'Administrador
			adminGroup := authGroup.Group("")
			adminGroup.Use(shared.RequireAdmin())
			{
				adminGroup.PUT("/editions/current", editionHandler.UpdateCurrentEdition)

				adminGroup.GET("/members", memberHandler.ListMembers)
				adminGroup.POST("/members", memberHandler.CreateMember)
				adminGroup.PUT("/members/:id", memberHandler.UpdateMember)

				adminGroup.GET("/incompatibilities", incompHandler.ListIncompatibilities)
				adminGroup.POST("/incompatibilities", incompHandler.CreateIncompatibility)
				adminGroup.DELETE("/incompatibilities/:id", incompHandler.DeleteIncompatibility)
				adminGroup.GET("/incompatibilities/check-viability", incompHandler.CheckViability)

				adminGroup.POST("/draw", drawHandler.ExecuteDraw)
			}
		}
	}

	addr := fmt.Sprintf(":%s", port)
	log.Printf("🎄 Servidor Yule Backend escoltant a http://localhost%s\n", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("Error engegant el servidor: %v", err)
	}
}
