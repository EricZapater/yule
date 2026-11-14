import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  Button,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Grid,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useYuleStore } from '../store';

export const AdminIncompatibilitiesView: React.FC = () => {
  const navigate = useNavigate();
  const {
    members,
    incompatibilities,
    viability,
    isLoading,
    fetchAdminData,
    createIncompatibility,
    deleteIncompatibility,
  } = useYuleStore();

  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [isMutual, setIsMutual] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!p1 || !p2 || p1 === p2) {
      alert('Tria dues persones diferents');
      return;
    }

    const ok = await createIncompatibility(
      p1,
      p2,
      isMutual,
      isMutual ? 'Parella / Mútua' : 'Unidireccional'
    );
    if (ok) {
      setP1('');
      setP2('');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2.5, md: 4 } }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/admin')}
        sx={{ mb: 2, color: '#1b4332' }}
      >
        Tornar al Tauler d'Administració
      </Button>

      <Typography
        variant="h4"
        sx={{
          fontFamily: "'Cinzel', serif",
          color: '#1b4332',
          fontWeight: 800,
          mb: 1,
        }}
      >
        INCOMPATIBILITATS PRIVADES
      </Typography>

      {/* Avis de confidencialitat i semàfor */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: '#fdf5f5',
              border: '1px solid #f2c7c7',
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              height: '100%',
              boxSizing: 'border-box',
            }}
          >
            <LockIcon sx={{ fontSize: 32, color: '#9d0208' }} />
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, color: '#8c1d1d' }}
              >
                Confidencialitat estricta
              </Typography>
              <Typography variant="body2" sx={{ color: '#8c1d1d', fontSize: '13px' }}>
                Aquestes regles només les pots veure tu. Cap familiar no sabrà
                mai quines exclusions estan configurades.
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: viability?.is_viable ? '#f0f9f3' : '#fef2f2',
              border: `1.5px solid ${viability?.is_viable ? '#7dc79a' : '#f87171'}`,
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              height: '100%',
              boxSizing: 'border-box',
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                bgcolor: viability?.is_viable ? '#1b7a42' : '#dc2626',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '18px',
              }}
            >
              {viability?.is_viable ? '✓' : '✕'}
            </Box>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: viability?.is_viable ? '#0b4522' : '#991b1b',
                }}
              >
                {viability?.is_viable
                  ? 'Sorteig 100% Viable'
                  : 'Sorteig Matemàticament Inviable'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: viability?.is_viable ? '#275e3c' : '#b91c1c',
                  fontSize: '13px',
                }}
              >
                {viability?.reason ||
                  'Comprovant combinacions matemàtiques de la família...'}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Formulari d'afegir exclusió + Taula */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                color: '#1b4332',
                mb: 2.5,
              }}
            >
              Afegir nova exclusió
            </Typography>

            <Box component="form" onSubmit={handleAddRule}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Persona que NO pot regalar...</InputLabel>
                <Select
                  value={p1}
                  label="Persona que NO pot regalar..."
                  onChange={(e) => setP1(e.target.value)}
                  required
                >
                  {members.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2.5 }}>
                <InputLabel>Persona que NO pot rebre regal...</InputLabel>
                <Select
                  value={p2}
                  label="Persona que NO pot rebre regal..."
                  onChange={(e) => setP2(e.target.value)}
                  required
                >
                  {members
                    .filter((m) => m.id !== p1)
                    .map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <Typography
                variant="caption"
                sx={{ display: 'block', mb: 1, fontWeight: 700 }}
              >
                Tipus d'exclusió:
              </Typography>
              <ToggleButtonGroup
                color="primary"
                value={isMutual}
                exclusive
                fullWidth
                onChange={(_, val) => {
                  if (val !== null) setIsMutual(val);
                }}
                sx={{ mb: 3 }}
              >
                <ToggleButton value={true} sx={{ fontSize: '13px' }}>
                  ⇄ Mútua (Parella / Cap dels dos)
                </ToggleButton>
                <ToggleButton value={false} sx={{ fontSize: '13px' }}>
                  &rarr; Unidireccional
                </ToggleButton>
              </ToggleButtonGroup>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={isLoading || !p1 || !p2 || p1 === p2}
              >
                + Desar exclusió
              </Button>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                color: '#1b4332',
                mb: 2,
              }}
            >
              Exclusions actives ({incompatibilities.length})
            </Typography>

            {incompatibilities.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No hi ha cap exclusió configurada. El sorteig es farà de forma
                100% aleatòria entre tota la família.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Familiar 1</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Relació</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Familiar 2</TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {incompatibilities.map((inc) => (
                      <TableRow key={inc.id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>
                          {inc.person1.name}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={inc.is_mutual ? '⇄ Mútua' : '&rarr; No regala a'}
                            size="small"
                            sx={{
                              bgcolor: '#fbf1de',
                              color: '#7d5100',
                              fontWeight: 700,
                              fontSize: '11px',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          {inc.person2.name}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => deleteIncompatibility(inc.id)}
                            title="Eliminar regla"
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};
