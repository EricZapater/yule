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
  IconButton,
  Divider,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CasinoIcon from '@mui/icons-material/Casino';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LockIcon from '@mui/icons-material/Lock';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import EditIcon from '@mui/icons-material/Edit';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useNavigate } from 'react-router-dom';
import { useYuleStore } from '../store';
import { yuleApi } from '../api';

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
    updateEdition,
    executeDraw,
  } = useYuleStore();

  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  // Modal d'Edició del Mestre de Sorteig
  const [openEditionModal, setOpenEditionModal] = useState(false);
  const [editionName, setEditionName] = useState('');
  const [editionBudget, setEditionBudget] = useState('30');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchEdition();
    fetchAdminData();
  }, [fetchEdition, fetchAdminData]);

  const handleOpenEditionModal = () => {
    setEditionName(currentEdition?.name || 'Nadal 2026');
    setEditionBudget(currentEdition?.budget_limit?.toString() || '30');
    setOpenEditionModal(true);
  };

  const handleSaveEdition = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = parseFloat(editionBudget) || 0;
    const ok = await updateEdition({
      name: editionName.trim(),
      budget_limit: budgetNum,
    });
    if (ok) {
      setToastMessage('Paràmetres del sorteig actualitzats amb èxit! ✨');
      setOpenEditionModal(false);
    }
  };

  const handleCopyWhatsApp = (name: string, url: string) => {
    navigator.clipboard.writeText(url);
    setToastMessage(`Enllaç màgic de ${name} copiat al porta-retalls! Ja el pots enviar per WhatsApp.`);
  };

  const handleResendEmail = async (email: string, name: string) => {
    try {
      await yuleApi.requestMagicLink(email);
      setToastMessage(`S'ha reenviat el Magic Link per correu a ${name} (${email})!`);
    } catch {
      setToastMessage(`No s'ha pogut reenviar el correu a ${email}.`);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;

    const ok = await createMember(newMemberName.trim(), newMemberEmail.trim());
    if (ok) {
      setNewMemberName('');
      setNewMemberEmail('');
      setOpenInviteModal(false);
      setToastMessage('Familiar afegit al cens de la família correctament!');
    }
  };

  const handleTriggerDraw = async () => {
    const isRedo = currentEdition?.status === 'drawn';
    const confirmMsg = isRedo
      ? 'Segur que vols REPETIR el sorteig? Es generaran noves parelles secretes i es substituiran les actuals.'
      : 'Vols celebrar el sorteig ara? Cada familiar veurà el seu amic invisible i rebrà el correu si està configurat.';

    if (!window.confirm(confirmMsg)) return;

    const ok = await executeDraw();
    if (ok) {
      setToastMessage('🎉 El sorteig s’ha executat amb èxit! Tothom ja té el seu amic invisible assignat.');
    } else {
      alert("No s'ha pogut executar el sorteig. Comprova que hi hagi un mínim de 3 membres i que les regles siguin viables.");
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Pendent';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return 'Pendent de celebració';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ca-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2.5, md: 4 }, mb: 8 }}>
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
          Estructura del sorteig de la família: paràmetres mestres, assignacions i llistes de desitjos.
        </Typography>
      </Box>

      {/* =========================================================================
          MESTRE: DADES DEL SORTEIG (EDICIÓ)
          ========================================================================= */}
      <Card
        sx={{
          mb: 4,
          p: { xs: 2.5, md: 3.5 },
          border: '2px solid #d4af37',
          background: 'radial-gradient(circle at 100% 0%, #fffdf8 0%, #ffffff 80%)',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h5" sx={{ fontFamily: "'Cinzel', serif", fontWeight: 800, color: '#143226' }}>
              🎄 {currentEdition?.name || 'Nadal 2026'}
            </Typography>
            <IconButton
              size="small"
              onClick={handleOpenEditionModal}
              title="Configurar dades del sorteig"
              sx={{ color: '#d4af37' }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={currentEdition?.status === 'drawn' ? '🎉 Sorteig Celebrat' : '⏳ Llistes Obertes'}
              color={currentEdition?.status === 'drawn' ? 'success' : 'warning'}
              sx={{ fontWeight: 700 }}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={handleOpenEditionModal}
              sx={{ borderColor: '#d4af37', color: '#7a5300', fontWeight: 600, fontSize: '12px' }}
            >
              Configurar Import i Nom
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Metadades del Mestre: Data creació, Data celebració, Import màxim */}
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ bgcolor: '#faf7f2', p: 2, borderRadius: 2, border: '1px solid #ebd8b2' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <AttachMoneyIcon sx={{ color: '#d4af37', fontSize: 20 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#6d4e00', textTransform: 'uppercase' }}>
                  Import màxim de regal
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1b4332' }}>
                {currentEdition?.budget_limit && currentEdition.budget_limit > 0
                  ? `${currentEdition.budget_limit.toFixed(2)} €`
                  : 'Lliure (Sense límit)'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Configurat per a aquesta edició
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box sx={{ bgcolor: '#faf7f2', p: 2, borderRadius: 2, border: '1px solid #ebd8b2' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <CalendarMonthIcon sx={{ color: '#1b4332', fontSize: 20 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#6d4e00', textTransform: 'uppercase' }}>
                  Data de creació
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1b4332' }}>
                {formatDate(currentEdition?.created_at)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Inici d'inscripcions i llistes
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box sx={{ bgcolor: '#faf7f2', p: 2, borderRadius: 2, border: '1px solid #ebd8b2' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <EventAvailableIcon sx={{ color: currentEdition?.drawn_at ? '#2d6a4f' : '#b7094c', fontSize: 20 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#6d4e00', textTransform: 'uppercase' }}>
                  Data de celebració
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: currentEdition?.drawn_at ? '#1b4332' : 'text.secondary' }}>
                {formatDateTime(currentEdition?.drawn_at)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentEdition?.drawn_at ? 'Sorteig finalitzat' : 'Pendent de prémer el botó'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* =========================================================================
          DETALL 1: ASSIGNACIONS I EXECUCIÓ DEL SORTEIG
          ========================================================================= */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '1.5px solid #d4af37',
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontFamily: "'Cinzel', serif", fontWeight: 700, color: '#143226', mb: 1 }}>
                🎲 Detall d'Assignacions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Quan tothom hagi afegit idees, prem el botó per resoldre l'algorisme secret de permutació.
              </Typography>

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
                    Regles d'Exclusió Privades ({incompatibilities.length})
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

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1b4332', mb: 2 }}>
              📊 Estat dels participants del sorteig
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ bgcolor: '#faf7f2', p: 2, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#1b4332' }}>
                    {members.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Familiars censats
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ bgcolor: '#faf7f2', p: 2, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#2d6a4f' }}>
                    {members.filter((m) => m.wishlist_items_count > 0).length} / {members.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Amb llista activa
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* =========================================================================
          DETALL 2: LLISTES DE DESITJOS I CENS DE MEMBRES VINCULATS
          ========================================================================= */}
      <Card sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2.5,
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontFamily: "'Cinzel', serif", fontWeight: 700 }}>
              Detall de Membres i Llistes de Desitjos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cada membre té la seva llista de desitjos vinculada exclusivament a aquest sorteig.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenInviteModal(true)}
            sx={{ fontWeight: 700 }}
          >
            + Convidar familiar
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Familiar</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Correu electrònic</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Desitjos en aquest sorteig</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Accions d'accés
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {m.name} {m.role === 'admin' && '👑'}
                  </TableCell>
                  <TableCell color="text.secondary">{m.email}</TableCell>
                  <TableCell>
                    {m.wishlist_items_count > 0 ? (
                      <Chip
                        label={`✓ ${m.wishlist_items_count} desitjos afegits`}
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
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<MailOutlineIcon />}
                        onClick={() => handleResendEmail(m.email, m.name)}
                        sx={{ fontSize: '12px' }}
                      >
                        Reenviar Email
                      </Button>
                      <Button
                        variant="outlined"
                        color="success"
                        size="small"
                        startIcon={<WhatsAppIcon />}
                        onClick={() => handleCopyWhatsApp(m.name, m.magic_link_url)}
                        sx={{ fontSize: '12px' }}
                      >
                        WhatsApp
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* =========================================================================
          MODAL: CONFIGURAR PARÀMETRES DEL SORTEIG (MESTRE)
          ========================================================================= */}
      <Dialog open={openEditionModal} onClose={() => setOpenEditionModal(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleSaveEdition}>
          <DialogTitle sx={{ fontFamily: "'Cinzel', serif", fontWeight: 700 }}>
            Configuració del Sorteig
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Modifica el nom de referència i l'import màxim acordat per la família.
            </Typography>
            <TextField
              label="Nom de l'edició / sorteig"
              placeholder="ex: Nadal 2026"
              fullWidth
              value={editionName}
              onChange={(e) => setEditionName(e.target.value)}
              required
              sx={{ mb: 2.5, mt: 1 }}
            />
            <TextField
              label="Import màxim de regal (€)"
              placeholder="ex: 30.00 (o 0 si no hi ha límit)"
              type="number"
              fullWidth
              value={editionBudget}
              onChange={(e) => setEditionBudget(e.target.value)}
              helperText="Els familiars veuran aquest pressupost com a referència a la seva llista."
              sx={{ mb: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenEditionModal(false)}>Cancel·lar</Button>
            <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
              Desar canvis
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* =========================================================================
          MODAL: CONVIDAR FAMILIAR
          ========================================================================= */}
      <Dialog open={openInviteModal} onClose={() => setOpenInviteModal(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleInviteSubmit}>
          <DialogTitle sx={{ fontFamily: "'Cinzel', serif", fontWeight: 700 }}>
            Convidar un nou familiar
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Nom del familiar"
              placeholder="ex: Oncle Joan"
              fullWidth
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              required
              sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              label="Correu electrònic"
              type="email"
              placeholder="ex: joan@familia.cat"
              fullWidth
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenInviteModal(false)}>Cancel·lar</Button>
            <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
              Afegir al sorteig
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

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
