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
import { useYuleStore } from '../store';

export const GiftAssignedView: React.FC = () => {
  const { assignment, isLoading, fetchAssignment, markItemPurchased } =
    useYuleStore();

  useEffect(() => {
    fetchAssignment();
  }, [fetchAssignment]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!assignment) {
    return (
      <Container maxWidth="md" sx={{ mt: 5, textAlign: 'center' }}>
        <Card sx={{ p: 4, bgcolor: '#ffffff', border: '2px solid #d4af37' }}>
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
            L'administrador de la família està acabant de recollir les llistes i
            incompatibilitats. Tan bon punt premi el botó, rebràs un correu i
            veuràs aquí la teva persona assignada!
          </Typography>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 2.5, md: 4 } }}>
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
