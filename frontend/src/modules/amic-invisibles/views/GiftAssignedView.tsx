import React, { useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { useYuleStore } from '../store';

export const GiftAssignedView: React.FC = () => {
  const navigate = useNavigate();
  const {
    assignment,
    myWishlist,
    isWishlistLoaded,
    isLoading,
    fetchAssignment,
    fetchMyWishlist,
    markItemPurchased,
  } = useYuleStore();

  useEffect(() => {
    fetchAssignment();
    fetchMyWishlist();
  }, [fetchAssignment, fetchMyWishlist]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!assignment) {
    return (
      <Container maxWidth="md" sx={{ mt: { xs: 3, md: 5 } }}>
        {/* Avís si la llista de desitjos està buida */}
        {isWishlistLoaded && myWishlist.length === 0 && (
          <Card
            sx={{
              mb: 3,
              p: { xs: 2.5, md: 3.5 },
              bgcolor: '#fffbf0',
              border: '2px dashed #b7094c',
              borderRadius: 3,
              textAlign: 'center',
              boxShadow: '0 4px 14px rgba(183, 9, 76, 0.08)',
            }}
          >
            <Typography variant="h6" sx={{ fontFamily: "'Cinzel', serif", color: '#9d0208', fontWeight: 800, mb: 1 }}>
              ⚠️ Encara no has afegit cap desig a la teva llista!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 540, mx: 'auto', mb: 2.5 }}>
              Mentre l'administrador prepara el sorteig, és imprescindible que tinguis la teva llista preparada perquè el teu futur amic invisible secret sàpiga què fa més il·lusió.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/wishlist')}
              sx={{
                bgcolor: '#9d0208',
                color: '#fff',
                fontWeight: 700,
                px: 3.5,
                py: 1,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(157, 2, 8, 0.25)',
                '&:hover': { bgcolor: '#7b0005' },
              }}
            >
              📝 Crear la meva llista de desitjos
            </Button>
          </Card>
        )}

        {isWishlistLoaded && myWishlist.length > 0 && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: '#e8f5e9',
                px: 2.5,
                py: 1,
                borderRadius: 2,
                border: '1px solid #c8e6c9',
              }}
            >
              <CheckCircleOutlineIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                Ja tens {myWishlist.length} {myWishlist.length === 1 ? 'regal afegit' : 'regals afegits'} a la teva llista. Tot a punt pel sorteig!
              </Typography>
            </Box>
          </Box>
        )}

        <Card sx={{ p: 4, bgcolor: '#ffffff', border: '2px solid #d4af37', textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            ⏳
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontFamily: "'Cinzel', serif",
              color: '#1b4332',
              fontWeight: 700,
              mb: 1.5,
            }}
          >
            El sorteig encara no s'ha celebrat
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
            L'administrador de la família està acabant de preparar el sorteig i
            recollir les llistes de desitjos. Tan bon punt premi el botó, rebràs
            un correu i veuràs aquí la teva persona assignada!
          </Typography>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 2.5, md: 4 } }}>
      {/* Avís si el sorteig s'ha celebrat però l'usuari no té llista */}
      {isWishlistLoaded && myWishlist.length === 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 3, borderRadius: 2, border: '1px solid #ffeeba' }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate('/wishlist')}
              sx={{ fontWeight: 700 }}
            >
              Afegir desitjos
            </Button>
          }
        >
          <strong>Recordatori:</strong> Encara no has afegit la teva llista de regals! El teu amic invisible secret no sabrà què regalar-te.
        </Alert>
      )}

      {/* Targeta Festiva de Revelació */}
      <Card
        sx={{
          mb: 4,
          p: { xs: 3, md: 4 },
          textAlign: 'center',
          border: '2px solid #d4af37',
          background: 'radial-gradient(circle at 50% 0%, #fffdf8 0%, #ffffff 80%)',
          boxShadow: '0 8px 24px rgba(27, 67, 50, 0.08)',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            color: '#9d0208',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            mb: 1,
          }}
        >
          🎁 Aquest Nadal et toca regalar a...
        </Typography>

        <Typography
          variant="h3"
          sx={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 800,
            color: '#143226',
            my: 1.5,
          }}
        >
          {assignment.recipient.name}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Chip
            label={`🏷️ Pressupost acordat: Màx. ${assignment.budget_limit.toFixed(2)} €`}
            sx={{
              bgcolor: '#fbf6e2',
              color: '#7a5d00',
              fontWeight: 700,
              border: '1px dashed #d4af37',
              fontSize: '13px',
              py: 2,
            }}
          />
        </Box>
      </Card>

      {/* Capçalera Llista de Desitjos */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontFamily: "'Cinzel', serif",
            color: '#1b4332',
            fontWeight: 700,
          }}
        >
          Idees que li agraden
        </Typography>
        <Chip
          label={`${assignment.wishlist.length} idees`}
          size="small"
          sx={{ bgcolor: '#e8eee9', color: '#1b4332', fontWeight: 600 }}
        />
      </Box>

      {assignment.wishlist.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          En/na {assignment.recipient.name} encara no ha afegit idees a la seva
          llista. Pots anar pensant un detall o tornar a consultar més endavant!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {assignment.wishlist.map((item) => (
            <Grid item xs={12} sm={6} key={item.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-3px)' },
                }}
              >
                {item.image_url && (
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="190"
                      image={item.image_url}
                      alt={item.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <Chip
                      label="📷 Foto des de la botiga"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        bgcolor: 'rgba(0,0,0,0.65)',
                        color: '#fff',
                        fontSize: '11px',
                        backdropFilter: 'blur(4px)',
                      }}
                    />
                  </Box>
                )}

                <CardContent sx={{ flex: 1, p: 2.5 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: '#0d1e17',
                      lineHeight: 1.3,
                      mb: 0.5,
                    }}
                  >
                    {item.title}
                  </Typography>

                  {item.price_estimated && (
                    <Typography
                      variant="body2"
                      sx={{ color: '#9d0208', fontWeight: 700, mb: 1.5 }}
                    >
                      Aprox. {item.price_estimated.toFixed(2)} €
                    </Typography>
                  )}

                  {item.notes && (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: '#faf7f2',
                        borderLeft: '3px solid #d4af37',
                        fontSize: '13px',
                        color: 'text.secondary',
                        mb: 2,
                      }}
                    >
                      "{item.notes}"
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 1.5, mt: 'auto', pt: 1 }}>
                    {item.url && (
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<ShoppingBagIcon />}
                        sx={{ fontSize: '13px' }}
                      >
                        Obrir botiga
                      </Button>
                    )}

                    <Button
                      variant={item.is_marked_by_me ? 'contained' : 'outlined'}
                      color={item.is_marked_by_me ? 'success' : 'primary'}
                      fullWidth={!item.url}
                      onClick={() =>
                        markItemPurchased(item.id, !item.is_marked_by_me)
                      }
                      startIcon={
                        item.is_marked_by_me ? (
                          <CheckCircleIcon />
                        ) : (
                          <CheckCircleOutlineIcon />
                        )
                      }
                      sx={{ fontSize: '12px', whiteSpace: 'nowrap' }}
                    >
                      {item.is_marked_by_me ? 'Comprat' : 'Tinc pensat'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};
