import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Grid,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CasinoIcon from '@mui/icons-material/Casino';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LockIcon from '@mui/icons-material/Lock';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from 'react-router-dom';
import { useYuleStore } from '../store';

export const AdminDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentEdition,
    members,
    incompatibilities,
    viability,
    isLoading,
    fetchEdition,
    fetchAdminData,
    createMember,
    executeDraw,
  } = useYuleStore();

  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchEdition();
    fetchAdminData();
  }, [fetchEdition, fetchAdminData]);

  const handleCopyWhatsApp = (name: string, url: string) => {
    navigator.clipboard.writeText(url);
    setToastMessage(`Enllaç màgic de ${name} copiat al porta-retalls! Ja el pots enviar per WhatsApp.`);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;

    const ok = await createMember(newMemberName.trim(), newMemberEmail.trim());
    if (ok) {
      setNewMemberName('');
      setNewMemberEmail('');
      setOpenInviteModal(false);
      setToastMessage('Familiar convidat correctament!');
    } else {
      alert("Error registrant familiar. Comprova que el correu no estigui repetit.");
    }
  };

  const handleTriggerDraw = async () => {
    if (!window.confirm("Segur que vols executar el sorteig? S'assignaran les parelles secrets i tothom podrà veure el seu amic invisible.")) {
      return;
    }

    const ok = await executeDraw();
    if (ok) {
      setToastMessage('🎉 El sorteig s’ha executat amb èxit! Notificacions enviades.');
    } else {
      alert("No s'ha pogut executar el sorteig. Comprova que hi hagi un mínim de 3 membres i que les incompatibilitats siguin viables.");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2.5, md: 4 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Cinzel', serif",
            color: '#1b4332',
            fontWeight: 800,
          }}
        >
          PANELL D'ADMINISTRACIÓ
        </Typography>
        <Typography color="text.secondary">
          Gestió del cens familiar, exclusions d'incompatibilitat i llançament del sorteig.
        </Typography>
      </Box>

      {/* Fila superior: Resum + Estat Viabilitat */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontFamily: "'Cinzel', serif", fontWeight: 700 }}>
                {currentEdition?.name || 'Nadal 2026'}
              </Typography>
              <Chip
                label={currentEdition?.status === 'drawn' ? '🎉 Sortejat' : 'Llistes obertes'}
                color={currentEdition?.status === 'drawn' ? 'success' : 'warning'}
                sx={{ fontWeight: 700 }}
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ bgcolor: '#faf7f2', p: 1.5, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#1b4332' }}>
                    {members.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Familiars actius
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={4}>
                <Box sx={{ bgcolor: '#faf7f2', p: 1.5, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#1b4332' }}>
                    {currentEdition?.budget_limit.toFixed(0) || '30'} €
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Límit de regal
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={4}>
                <Box sx={{ bgcolor: '#faf7f2', p: 1.5, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#1b4332' }}>
                    {members.filter((m) => m.wishlist_items_count > 0).length} / {members.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Amb llista feta
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '1.5px solid #d4af37',
              background: 'radial-gradient(circle at 100% 0%, #fffdf8 0%, #ffffff 80%)',
            }}
          >
            <Box
              onClick={() => navigate('/admin/incompatibilities')}
              sx={{
                bgcolor: '#faf4e8',
                border: '1px solid #ebd8b2',
                borderRadius: 2,
                p: 2,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                '&:hover': { bgcolor: '#f4ebd8' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockIcon sx={{ fontSize: 18, color: '#7a5300' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7a5300' }}>
                  Incompatibilitats ({incompatibilities.length})
                </Typography>
              </Box>
              <Chip
                label={viability?.is_viable ? 'Viable ✅' : 'Inviable ❌'}
                color={viability?.is_viable ? 'success' : 'error'}
                size="small"
                sx={{ fontWeight: 700 }}
              />
              <ArrowForwardIosIcon sx={{ fontSize: 14, color: '#7a5300' }} />
            </Box>

            <Button
              variant="contained"
              color="secondary"
              size="large"
              fullWidth
              startIcon={<CasinoIcon />}
              onClick={handleTriggerDraw}
              disabled={isLoading || !viability?.is_viable || members.length < 3}
              sx={{
                py: 1.8,
                fontSize: '16px',
                fontWeight: 800,
                letterSpacing: '0.5px',
                boxShadow: '0 4px 14px rgba(157,2,8,0.3)',
              }}
            >
              {currentEdition?.status === 'drawn' ? 'REPETIR EL SORTEIG 🎲' : 'EXECUTAR EL SORTEIG 🎲'}
            </Button>
          </Card>
        </Grid>
      </Grid>

      {/* Llista del Cens Familiar */}
      <Card sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontFamily: "'Cinzel', serif", fontWeight: 700 }}>
            Família ({members.length} participants)
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenInviteModal(true)}
            size="small"
          >
            + Convidar familiar
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Familiar</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Correu</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estat Llista</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Accés ràpid
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{m.name}</TableCell>
                  <TableCell color="text.secondary">{m.email}</TableCell>
                  <TableCell>
                    {m.wishlist_items_count > 0 ? (
                      <Chip
                        label={`✓ ${m.wishlist_items_count} regals afegits`}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    ) : (
                      <Chip
                        label="⏳ Pendent d'afegir idees"
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      color="success"
                      size="small"
                      startIcon={<WhatsAppIcon />}
                      onClick={() => handleCopyWhatsApp(m.name, m.magic_link_url)}
                      sx={{ fontSize: '12px' }}
                    >
                      Copiar WhatsApp
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal Convidar Familiar */}
      <Dialog open={openInviteModal} onClose={() => setOpenInviteModal(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleInviteSubmit}>
          <DialogTitle sx={{ fontFamily: "'Cinzel', serif", fontWeight: 700 }}>
            Convidar un nou familiar
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Nom del familiar"
              placeholder="Ex: Laia, Oncle Joan..."
              fullWidth
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              required
              sx={{ mt: 1, mb: 2 }}
            />
            <TextField
              label="Correu electrònic"
              type="email"
              placeholder="laia@gmail.com"
              fullWidth
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenInviteModal(false)}>Cancel·lar</Button>
            <Button type="submit" variant="contained" color="primary">
              Desar i Convidar
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Toast de confirmació de còpia */}
      <Snackbar
        open={!!toastMessage}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%', borderRadius: 2 }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};
