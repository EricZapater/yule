package upload

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
	"yule/backend/internal/shared"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	uploadDir string
}

func NewHandler(uploadDir string) *Handler {
	_ = os.MkdirAll(uploadDir, 0755)
	return &Handler{uploadDir: uploadDir}
}

func (h *Handler) UploadPhoto(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		shared.RespondError(c, http.StatusBadRequest, "BAD_REQUEST", "Cal adjuntar un fitxer d'imatge")
		return
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		shared.RespondError(c, http.StatusBadRequest, "BAD_REQUEST", "Format d'imatge no permès (admesos: JPG, PNG, WebP)")
		return
	}

	newFileName := fmt.Sprintf("gift-%d-%s%s", time.Now().Unix(), uuid.New().String()[:8], ext)
	dst := filepath.Join(h.uploadDir, newFileName)

	if err := c.SaveUploadedFile(file, dst); err != nil {
		shared.RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Error desant la foto")
		return
	}

	photoURL := fmt.Sprintf("/uploads/photos/%s", newFileName)
	c.JSON(http.StatusCreated, gin.H{
		"url": photoURL,
	})
}
