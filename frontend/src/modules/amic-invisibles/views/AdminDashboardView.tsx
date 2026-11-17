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
  FormControlLabel,
  Checkbox,
  Switch,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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
import DeleteIcon from '@mui/icons-material/Delete';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TerminalIcon from '@mui/icons-material/Terminal';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useNavigate } from 'react-router-dom';
import { useYuleStore } from '../store';
import { yuleApi } from '../api';
import { SystemLogEntry } from '../types';

export const AdminDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentEdition,
    editions,
    members,
    incompatibilities,
    viability,
    isLoading,
    fetchEdition,
    fetchEditions,
    fetchAdminData,
    createMember,
    updateMemberStatus,
    createEdition,
    updateEdition,
    deleteEdition,
    resetDraw,
    executeDraw,
    notifyDraw,
  } = useYuleStore();

  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  // Modal d'Edició del Mestre de Sorteig
  const [openEditionModal, setOpenEditionModal] = useState(false);
  const [editionName, setEditionName] = useState('');
  const [editionBudget, setEditionBudget] = useState('30');

  // Modal de Creació de Nou Sorteig Mestre
  const [openCreateEditionModal, setOpenCreateEditionModal] = useState(false);
  const [newEditionYear, setNewEditionYear] = useState('');
  const [newEditionName, setNewEditionName] = useState('');
  const [newEditionBudget, setNewEditionBudget] = useState('30');
  const [newEditionCopyMembers, setNewEditionCopyMembers] = useState(true);
  const [createEditionError, setCreateEditionError] = useState<string | null>(null);

  // Modal de Logs de Diagnòstic
  const [openLogsModal, setOpenLogsModal] = useState(false);
  const [logs, setLogs] = useState<SystemLogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logFilter, setLogFilter] = useState<'ALL' | 'ERROR' | 'WARN' | 'INFO'>('ALL');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchEdition();
    fetchEditions();
    fetchAdminData();
  }, [fetchEdition, fetchEditions, fetchAdminData]);

  const handleOpenCreateModal = () => {
    const nextYear = currentEdition?.year ? currentEdition.year + 1 : new Date().getFullYear();
    setNewEditionYear(nextYear.toString());
    setNewEditionName(`Nadal ${nextYear}`);
    setNewEditionBudget(currentEdition?.budget_limit ? currentEdition.budget_limit.toString() : '30');
    setNewEditionCopyMembers(true);
    setCreateEditionError(null);
    setOpenCreateEditionModal(true);
  };

  const handleCreateEdition = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateEditionError(null);
    const yearNum = parseInt(newEditionYear, 10);
    if (!yearNum || !newEditionName.trim()) {
      setCreateEditionError("Cal introduir l'any i el nom del sorteig.");
      return;
    }

    const budgetNum = parseFloat(newEditionBudget) || 0;
    const ok = await createEdition({
      year: yearNum,
      name: newEditionName.trim(),
      budget_limit: budgetNum,
      copy_members: newEditionCopyMembers,
    });
    if (ok) {
      setToastMessage(`🎉 Nou sorteig "${newEditionName}" creat amb èxit!`);
      setOpenCreateEditionModal(false);
      setCreateEditionError(null);
    } else {
      const err = useYuleStore.getState().error || "No s'ha pogut crear el nou sorteig.";
      setCreateEditionError(err);
    }
  };

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

  const activeMembers = members.filter((m) => m.is_active);

  const handleToggleActive = async (id: string, name: string, newActive: boolean) => {
    const ok = await updateMemberStatus(id, newActive);
    if (ok) {
      setToastMessage(
        newActive
          ? `✅ ${name} s'ha activat per participar al sorteig!`
          : `⏸️ ${name} s'ha desactivat del sorteig (es manté al cens).`
      );
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
      setToastMessage('🎉 El sorteig s’ha executat amb èxit! S’han enviat les notificacions per correu a tothom.');
    } else {
      alert("No s'ha pogut executar el sorteig. Comprova que hi hagi un mínim de 3 membres i que les regles siguin viables.");
    }
  };

  const handleResendDrawEmails = async () => {
    if (!window.confirm("Vols enviar els correus del sorteig a tots els participants amb les parelles actuals?")) return;
    const count = await notifyDraw();
    if (count >= 0) {
      setToastMessage(`📨 S'han enviat els correus del sorteig a ${count} participants!`);
    } else {
      alert("No s'han pogut enviar els correus. Comprova la configuració del servidor SMTP.");
    }
  };

  const handleResetDraw = async () => {
    if (!window.confirm("Segur que vols esborrar els resultats del sorteig? Les parelles secretes s'eliminaran i les llistes tornaran a quedar obertes.")) return;
    const ok = await resetDraw();
    if (ok) {
      setToastMessage("🔄 S'han esborrat els resultats del sorteig. Les llistes tornen a estar obertes!");
    } else {
      alert("No s'han pogut esborrar els resultats del sorteig.");
    }
  };

  const handleDeleteEdition = async (id: string, name: string) => {
    if (!window.confirm(`Segur que vols eliminar completament el sorteig "${name}"? S'esborraran tots els seus membres, llistes i dades associades.`)) return;
    const ok = await deleteEdition(id);
    if (ok) {
      setToastMessage(`🗑️ Sorteig "${name}" eliminat correctament.`);
    } else {
      alert("No s'ha pogut eliminar el sorteig.");
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

  const handleOpenLogsModal = () => {
    setOpenLogsModal(true);
    fetchLogs();
  };

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await yuleApi.getSystemLogs();
      setLogs(res.data.logs || []);
    } catch {
      setToastMessage("No s'han pogut carregar els logs del sistema.");
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleCopyLog = (entry: SystemLogEntry) => {
    const text = JSON.stringify(entry, null, 2);
    navigator.clipboard.writeText(text);
    setToastMessage(`Log [${entry.method} ${entry.path}] copiat al porta-retalls! 📋`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2.5, md: 4 }, mb: 8 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
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
        <Button
          variant="outlined"
          color="info"
          startIcon={<TerminalIcon />}
          onClick={handleOpenLogsModal}
          sx={{ fontWeight: 700, borderRadius: 2 }}
        >
          Logs del Sistema 📋
        </Button>
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
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
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateModal}
              sx={{
                bgcolor: '#1b4332',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '12px',
                '&:hover': { bgcolor: '#2d6a4f' },
              }}
            >
              Nou Sorteig
            </Button>
            {editions.length > 1 && currentEdition && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => handleDeleteEdition(currentEdition.id, currentEdition.name)}
                sx={{ fontWeight: 600, fontSize: '12px' }}
              >
                Eliminar Sorteig
              </Button>
            )}
          </Box>
        </Box>

        {editions.length > 1 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#6d4e00' }}>
              Historial de sortejos:
            </Typography>
            {editions.map((ed) => (
              <Chip
                key={ed.id}
                label={`${ed.name} (${ed.year})`}
                size="small"
                variant={ed.id === currentEdition?.id ? 'filled' : 'outlined'}
                onDelete={() => handleDeleteEdition(ed.id, ed.name)}
                deleteIcon={<DeleteIcon style={{ fontSize: '14px' }} />}
                sx={{
                  fontSize: '11px',
                  fontWeight: ed.id === currentEdition?.id ? 700 : 500,
                  bgcolor: ed.id === currentEdition?.id ? '#1b4332' : 'transparent',
                  color: ed.id === currentEdition?.id ? '#fff' : '#495057',
                  borderColor: '#ebd8b2',
                  '& .MuiChip-deleteIcon': {
                    color: ed.id === currentEdition?.id ? '#ffcdd2' : '#d32f2f',
                    '&:hover': { color: '#ff1744' },
                  },
                }}
              />
            ))}
          </Box>
        )}

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
              disabled={isLoading || !viability?.is_viable || activeMembers.length < 3}
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

            {currentEdition?.status === 'drawn' && (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  size="medium"
                  fullWidth
                  startIcon={<MailOutlineIcon />}
                  onClick={handleResendDrawEmails}
                  disabled={isLoading}
                  sx={{
                    mt: 1.5,
                    py: 1.2,
                    fontSize: '14px',
                    fontWeight: 700,
                    borderColor: '#1b4332',
                    color: '#1b4332',
                    bgcolor: '#ffffff',
                    '&:hover': { bgcolor: '#eef5f1', borderColor: '#1b4332' },
                  }}
                >
                  Reenviar avisos del sorteig per correu 📨
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  size="medium"
                  fullWidth
                  startIcon={<RestartAltIcon />}
                  onClick={handleResetDraw}
                  disabled={isLoading}
                  sx={{
                    mt: 1.5,
                    py: 1.2,
                    fontSize: '14px',
                    fontWeight: 700,
                    bgcolor: '#ffffff',
                    '&:hover': { bgcolor: '#fdf2f2' },
                  }}
                >
                  Esborrar resultats del sorteig 🔄
                </Button>
              </>
            )}
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
                    {activeMembers.length}{' '}
                    <Typography component="span" variant="body1" color="text.secondary">
                      / {members.length}
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Participants actius{' '}
                    {members.length - activeMembers.length > 0 &&
                      `(${members.length - activeMembers.length} desactivats)`}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ bgcolor: '#faf7f2', p: 2, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#2d6a4f' }}>
                    {activeMembers.filter((m) => m.wishlist_items_count > 0).length} / {activeMembers.length}
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
                <TableCell sx={{ fontWeight: 700 }}>Participació al sorteig</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Desitjos en aquest sorteig</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Accions d'accés
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((m) => (
                <TableRow
                  key={m.id}
                  hover
                  sx={{
                    opacity: m.is_active ? 1 : 0.6,
                    bgcolor: m.is_active ? 'inherit' : '#fafafa',
                  }}
                >
                  <TableCell sx={{ fontWeight: 700 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{m.name}</span>
                      {m.role === 'admin' && (
                        <Chip
                          label="Admin 👑"
                          size="small"
                          sx={{
                            fontSize: '10px',
                            height: '18px',
                            bgcolor: '#fef3c7',
                            color: '#92400e',
                            fontWeight: 700,
                          }}
                        />
                      )}
                      {!m.is_active && (
                        <Typography component="span" variant="caption" sx={{ color: '#dc2626', fontWeight: 600 }}>
                          (No participa)
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell color="text.secondary">{m.email}</TableCell>
                  <TableCell>
                    <Tooltip
                      title={
                        m.is_active
                          ? 'Aquest familiar entrarà al sorteig. Clica per desactivar-lo si no vindrà.'
                          : 'Aquest familiar està desactivat d’aquest sorteig. Clica per reactivar-lo.'
                      }
                    >
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                        <Switch
                          checked={m.is_active}
                          onChange={(e) => handleToggleActive(m.id, m.name, e.target.checked)}
                          color="success"
                          size="small"
                        />
                        <Chip
                          label={m.is_active ? 'Actiu ✅' : 'Desactivat ⏸️'}
                          size="small"
                          color={m.is_active ? 'success' : 'default'}
                          variant={m.is_active ? 'filled' : 'outlined'}
                          onClick={() => handleToggleActive(m.id, m.name, !m.is_active)}
                          sx={{ fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}
                        />
                      </Box>
                    </Tooltip>
                  </TableCell>
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
          MODAL: CREAR NOU SORTEIG (MESTRE)
          ========================================================================= */}
      <Dialog open={openCreateEditionModal} onClose={() => setOpenCreateEditionModal(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleCreateEdition}>
          <DialogTitle sx={{ fontFamily: "'Cinzel', serif", fontWeight: 700, color: '#1b4332' }}>
            🎄 Crear un Nou Sorteig
          </DialogTitle>
          <DialogContent>
            {createEditionError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {createEditionError}
              </Alert>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Inicia una nova edició per a la família. Es mantindrà l'historial d'anys anteriors i els familiars podran traspassar els seus desitjos.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={5}>
                <TextField
                  label="Any"
                  type="number"
                  fullWidth
                  required
                  value={newEditionYear}
                  onChange={(e) => {
                    const yr = e.target.value;
                    setNewEditionYear(yr);
                    if (newEditionName.startsWith('Nadal ')) {
                      setNewEditionName(`Nadal ${yr}`);
                    }
                  }}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={7}>
                <TextField
                  label="Nom de l'Edició"
                  fullWidth
                  required
                  placeholder="ex: Nadal 2027"
                  value={newEditionName}
                  onChange={(e) => setNewEditionName(e.target.value)}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
            <TextField
              label="Pressupost màxim (€)"
              type="number"
              fullWidth
              placeholder="ex: 30.00 (o 0 si és lliure)"
              value={newEditionBudget}
              onChange={(e) => setNewEditionBudget(e.target.value)}
              helperText="Referència per a la llista de desitjos dels familiars."
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={newEditionCopyMembers}
                  onChange={(e) => setNewEditionCopyMembers(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  Vincular automàticament els familiars actuals ({members.length})
                </Typography>
              }
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenCreateEditionModal(false)}>Cancel·lar</Button>
            <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
              Crear Sorteig
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

      {/* =========================================================================
          MODAL: LOGS DEL SISTEMA (DIAGNÒSTIC)
          ========================================================================= */}
      <Dialog
        open={openLogsModal}
        onClose={() => setOpenLogsModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, maxHeight: '85vh' } }}
      >
        <DialogTitle sx={{ fontFamily: "'Cinzel', serif", fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TerminalIcon sx={{ color: '#1b4332' }} />
            <span>Logs del Servidor & Diagnòstic</span>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={fetchLogs} disabled={isLoadingLogs} title="Refrescar logs">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: '#0f172a', color: '#f8fafc', p: 2 }}>
          {/* Filtres per nivell */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', mr: 1 }}>
              Filtre:
            </Typography>
            {(['ALL', 'ERROR', 'WARN', 'INFO'] as const).map((lvl) => (
              <Chip
                key={lvl}
                label={lvl === 'ALL' ? 'Tots' : lvl}
                size="small"
                onClick={() => setLogFilter(lvl)}
                color={
                  logFilter === lvl
                    ? lvl === 'ERROR'
                      ? 'error'
                      : lvl === 'WARN'
                      ? 'warning'
                      : lvl === 'INFO'
                      ? 'success'
                      : 'primary'
                    : 'default'
                }
                variant={logFilter === lvl ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 700,
                  fontSize: '11px',
                  color: logFilter === lvl ? undefined : '#cbd5e1',
                  borderColor: '#334155',
                }}
              />
            ))}
            <Typography variant="caption" sx={{ color: '#64748b', ml: 'auto' }}>
              {logs.filter((l) => logFilter === 'ALL' || l.level === logFilter).length} registres
            </Typography>
          </Box>

          {isLoadingLogs ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Carregant logs del servidor...
              </Typography>
            </Box>
          ) : logs.filter((l) => logFilter === 'ALL' || l.level === logFilter).length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: '#64748b' }}>
              <Typography variant="body2">No hi ha logs registrats en aquest filtre.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: '55vh', overflowY: 'auto' }}>
              {logs
                .filter((l) => logFilter === 'ALL' || l.level === logFilter)
                .map((entry) => {
                  const isErr = entry.level === 'ERROR' || entry.level === 'PANIC';
                  const isWarn = entry.level === 'WARN';
                  const badgeColor = isErr ? '#ef4444' : isWarn ? '#f59e0b' : '#10b981';

                  return (
                    <Box
                      key={entry.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: '#1e293b',
                        border: '1px solid',
                        borderColor: isErr ? '#7f1d1d' : isWarn ? '#78350f' : '#334155',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            component="span"
                            sx={{
                              px: 0.8,
                              py: 0.2,
                              borderRadius: 1,
                              bgcolor: badgeColor,
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '10px',
                            }}
                          >
                            {entry.status} {entry.method}
                          </Box>
                          <Typography component="span" sx={{ color: '#e2e8f0', fontWeight: 600, fontSize: '12px' }}>
                            {entry.path}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography component="span" sx={{ color: '#94a3b8', fontSize: '11px' }}>
                            {entry.latency_ms.toFixed(1)}ms
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyLog(entry)}
                            title="Copiar log JSON"
                            sx={{ color: '#64748b', p: 0.5, '&:hover': { color: '#e2e8f0' } }}
                          >
                            <ContentCopyIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, color: '#64748b', fontSize: '11px', mb: 0.5 }}>
                        <span>🕒 {new Date(entry.timestamp).toLocaleTimeString('ca-ES')}</span>
                        <span>IP: {entry.client_ip}</span>
                        {entry.user_id && <span>User: {entry.user_id.slice(0, 8)}</span>}
                        <span>ID: {entry.request_id}</span>
                      </Box>

                      {entry.error_message && (
                        <Box
                          sx={{
                            mt: 1,
                            p: 1,
                            borderRadius: 1,
                            bgcolor: '#3b0d0c',
                            color: '#fca5a5',
                            border: '1px solid #7f1d1d',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          ❌ <strong>{entry.error_code || 'ERROR'}:</strong> {entry.error_message}
                        </Box>
                      )}

                      {entry.request_body && (
                        <Box
                          sx={{
                            mt: 0.8,
                            p: 0.8,
                            borderRadius: 1,
                            bgcolor: '#0f172a',
                            color: '#94a3b8',
                            border: '1px solid #1e293b',
                            fontSize: '11px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          📦 <em>Payload:</em> {entry.request_body}
                        </Box>
                      )}
                    </Box>
                  );
                })}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenLogsModal(false)} variant="contained" sx={{ bgcolor: '#1b4332' }}>
            Tancar
          </Button>
        </DialogActions>
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
