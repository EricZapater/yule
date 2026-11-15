import React, { useEffect, useState, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  TextField,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import { useYuleStore } from '../store';
import { yuleApi } from '../api';

export const WishlistView: React.FC = () => {
  const {
    myWishlist,
    currentEdition,
    isLoading,
    fetchEdition,
    fetchMyWishlist,
    addWishlistItem,
    deleteWishlistItem,
    copyPreviousWishlist,
  } = useYuleStore();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchEdition();
    fetchMyWishlist();
  }, [fetchEdition, fetchMyWishlist]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await yuleApi.uploadPhoto(file);
      setPhotoUrl(res.data.url);
    } catch {
      alert("Error pujant la fotografia. Comprova que sigui un arxiu d'imatge.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const priceNum = price ? parseFloat(price) : null;
    const ok = await addWishlistItem({
      title: title.trim(),
      price_estimated: priceNum,
      url: url.trim() || null,
      image_url: photoUrl,
      notes: notes.trim() || null,
    });

    if (ok) {
      setTitle('');
      setPrice('');
      setUrl('');
      setNotes('');
      setPhotoUrl(null);
    }
  };

  const handleCopyPrevious = async () => {
    const count = await copyPreviousWishlist();
    if (count > 0) {
      setFeedbackMsg(`S'han traspassat ${count} desitjos de l'edició anterior amb èxit! ✨`);
    } else {
      setFeedbackMsg("No s'han trobat desitjos d'edicions anteriors per traspassar.");
    }
  };

  const budget = currentEdition?.budget_limit && currentEdition.budget_limit > 0 ? currentEdition.budget_limit : null;
  const priceNum = parseFloat(price);
  const isOverBudget = budget !== null && !isNaN(priceNum) && priceNum > budget;

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 2.5, md: 4 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Cinzel', serif",
            color: '#1b4332',
            fontWeight: 800,
          }}
        >
          ELS MEUS DESITJOS
        </Typography>
        <Typography color="text.secondary">
          Posa idees perquè el teu amic invisible encerti el regal de Nadal!
        </Typography>
      </Box>

      {/* Indicador de Pressupost i Opció de traspàs */}
      <Box
        sx={{
          bgcolor: '#fbf6e2',
          border: '1px solid #d4af37',
          borderRadius: 3,
          p: 2,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography fontSize="20px">✨</Typography>
          <Typography variant="body2" sx={{ color: '#6d4e00', fontWeight: 600 }}>
            {budget !== null ? (
              <>
                Pressupost màxim de la família:{' '}
                <strong>{budget.toFixed(2)} €</strong> (orientatiu)
              </>
            ) : (
              <>Sense límit de pressupost fixat per l'administrador (lliure)</>
            )}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="warning"
          size="small"
          onClick={handleCopyPrevious}
          disabled={isLoading}
          sx={{ fontSize: '12px', fontWeight: 700 }}
        >
          📋 Traspassar desitjos d'edicions anteriors
        </Button>
      </Box>

      {feedbackMsg && (
        <Alert
          severity="info"
          onClose={() => setFeedbackMsg(null)}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {feedbackMsg}
        </Alert>
      )}

      {/* Formulari d'afegir desig */}
      <Card sx={{ mb: 4, p: { xs: 2.5, md: 3.5 } }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            color: '#143226',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <span>➕</span> Afegir una idea de regal
        </Typography>

        <Box component="form" onSubmit={handleAddWish}>
          <TextField
            label="Què t'agradaria? *"
            placeholder="Ex: Jersei de coll alt, un llibre..."
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Preu orientatiu (€)"
                type="number"
                placeholder="25.00"
                fullWidth
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                error={isOverBudget}
                helperText={
                  isOverBudget && budget !== null
                    ? `Supera el límit recomanat de ${budget.toFixed(2)} €`
                    : ''
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Enllaç web a la botiga (Opcional)"
                type="url"
                placeholder="https://..."
                fullWidth
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Càmera / Galeria / Pujada de fotos */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {!photoUrl ? (
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: '2px dashed #c5baa8',
                borderRadius: 3,
                p: 2.5,
                textAlign: 'center',
                bgcolor: '#faf8f5',
                cursor: 'pointer',
                mb: 2,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#f4eee3', borderColor: '#b7094c' },
              }}
            >
              {isUploading ? (
                <CircularProgress size={28} sx={{ color: '#1b4332' }} />
              ) : (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <PhotoCameraIcon sx={{ fontSize: 32, color: '#1b4332' }} />
                    <AddPhotoAlternateIcon sx={{ fontSize: 32, color: '#d4af37' }} />
                  </Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: '#1b4332' }}
                  >
                    Fes una foto o adjunta-la des de la galeria
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tria una imatge des de la teva galeria o fes una foto amb la càmera
                  </Typography>
                </>
              )}
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1.5,
                bgcolor: '#f4efe6',
                borderRadius: 2,
                border: '1px solid #dfd5c4',
                mb: 2,
              }}
            >
              <Box
                component="img"
                src={photoUrl}
                alt="Foto adjunta"
                sx={{
                  width: 54,
                  height: 54,
                  borderRadius: 1.5,
                  objectFit: 'cover',
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  📷 Foto adjuntada correctament
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Es veurà a la teva llista
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setPhotoUrl(null)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          <TextField
            label="Comentaris o detalls (Opcional)"
            placeholder="Talla M, color blau fosc, edició en català..."
            fullWidth
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mb: 2.5 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="secondary"
            fullWidth
            size="large"
            disabled={isLoading || !title.trim()}
            sx={{ py: 1.6, fontSize: '16px' }}
          >
            {isLoading ? 'Desant...' : 'Afegir a la meva llista 🎁'}
          </Button>
        </Box>
      </Card>

      {/* Llista dels desitjos guardats */}
      <Typography
        variant="h6"
        sx={{
          fontFamily: "'Cinzel', serif",
          fontWeight: 700,
          color: '#1b4332',
          mb: 2,
        }}
      >
        Idees afegides per tu ({myWishlist.length})
      </Typography>

      {myWishlist.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          Encara no has afegit cap idea. Comença afegint-ne alguna a dalt!
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {myWishlist.map((item) => (
            <Card
              key={item.id}
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              {item.image_url ? (
                <Box
                  component="img"
                  src={item.image_url}
                  alt={item.title}
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 2,
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 2,
                    bgcolor: '#ece7dc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}
                >
                  🎁
                </Box>
              )}

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {item.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.price_estimated && `Aprox. ${item.price_estimated.toFixed(2)} €`}
                  {item.image_url && ' • 📷 Amb foto'}
                  {item.url && ' • 🛒 Amb enllaç'}
                </Typography>
                {item.notes && (
                  <Typography variant="body2" sx={{ fontSize: '12px', mt: 0.5 }}>
                    "{item.notes}"
                  </Typography>
                )}
              </Box>

              <IconButton
                color="error"
                onClick={() => deleteWishlistItem(item.id)}
                title="Eliminar"
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};
