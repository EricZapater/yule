import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useYuleStore } from '../store';
import { yuleApi } from '../api';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, loginWithToken, isLoading, error } = useYuleStore();

  const [tab, setTab] = useState<number>(0); // 0 = Registre, 1 = Login Magic Link
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Detecció automàtica de Magic Link a la URL (?token=...)
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setIsVerifying(true);
      loginWithToken(token).then((ok) => {
        setIsVerifying(false);
        if (ok) {
          navigate('/');
        }
      });
    }
  }, [searchParams, loginWithToken, navigate]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLocalError(null);
    const ok = await register(name.trim(), email.trim());
    if (ok) {
      navigate('/');
    }
  };

  const handleRequestMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLocalError(null);
    try {
      const res = await yuleApi.requestMagicLink(email.trim());
      setSentMessage(res.data.message);
    } catch {
      setLocalError("Aquest correu no consta registrat al grup familiar. Si ets nou, fes servir la pestanya 'Registra't'.");
    }
  };

  if (isVerifying) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2 }}>
        <CircularProgress color="primary" />
        <Typography variant="h6" sx={{ fontFamily: "'Cinzel', serif", color: '#1b4332' }}>
          Validant el teu enllaç màgic... ✨
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xs" sx={{ mt: { xs: 4, md: 8 }, mb: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h2" sx={{ fontSize: '48px', mb: 1 }}>
          🎄
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 800,
            color: '#1b4332',
            letterSpacing: '1px',
          }}
        >
          YULE
        </Typography>
        <Typography color="text.secondary" variant="body2">
          L'Amic Invisible de la Família
        </Typography>
      </Box>

      <Card sx={{ p: { xs: 2.5, sm: 3.5 }, border: '1.5px solid #d4af37', borderRadius: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, newVal) => {
            setTab(newVal);
            setSentMessage(null);
            setLocalError(null);
          }}
          variant="fullWidth"
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label="Registra't 🎁"
            sx={{ fontWeight: 700, fontFamily: "'Cinzel', serif" }}
          />
          <Tab
            label="Ja tens compte 🔑"
            sx={{ fontWeight: 700, fontFamily: "'Cinzel', serif" }}
          />
        </Tabs>

        {(error || localError) && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error || localError}
          </Alert>
        )}

        {tab === 0 ? (
          // FORMULARI DE REGISTRE
          <Box component="form" onSubmit={handleRegisterSubmit}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#143226',
                mb: 0.5,
                textAlign: 'center',
              }}
            >
              Uneix-te a l'Amic Invisible
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2.5 }}>
              Afegeix el teu nom i correu per participar al sorteig de Nadal.
            </Typography>

            <TextField
              label="El teu nom o sobrenom"
              placeholder="ex: Maria, Avi Jordi, Marc..."
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              label="El teu correu electrònic"
              type="email"
              placeholder="ex: maria@familia.cat"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2.5 }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              startIcon={<HowToRegIcon />}
              disabled={isLoading || !name.trim() || !email.trim()}
              sx={{ py: 1.5, fontSize: '15px', fontWeight: 700 }}
            >
              Unir-me a l'Amic Invisible 🎄
            </Button>
          </Box>
        ) : (
          // FORMULARI DE LOGIN PER MAGIC LINK
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#143226',
                mb: 0.5,
                textAlign: 'center',
              }}
            >
              Accés per Magic Link
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2.5 }}>
              Escriu el teu correu i rebràs un enllaç directe per entrar amb 1 sol clic.
            </Typography>

            {sentMessage ? (
              <Alert severity="success" sx={{ borderRadius: 2, mb: 2 }}>
                {sentMessage}
              </Alert>
            ) : (
              <Box component="form" onSubmit={handleRequestMagicLink}>
                <TextField
                  label="El teu correu electrònic registrat"
                  type="email"
                  placeholder="ex: maria@familia.cat"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  sx={{ mb: 2.5 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  endIcon={<SendIcon />}
                  disabled={isLoading || !email.trim()}
                  sx={{ py: 1.5, fontSize: '15px', fontWeight: 700 }}
                >
                  Rebre enllaç al correu ✉️
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Card>
    </Container>
  );
};
