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
  Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useYuleStore } from '../store';
import { yuleApi } from '../api';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithToken, isLoading, error } = useYuleStore();

  const [email, setEmail] = useState('');
  const [sentMessage, setSentMessage] = useState<string | null>(null);
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

  const handleRequestMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      const res = await yuleApi.requestMagicLink(email.trim());
      setSentMessage(res.data.message);
    } catch {
      alert("Aquest correu no està registrat al grup familiar.");
    }
  };

  // Accés ràpid de simulació per desenvolupament/test
  const handleSimulateQuickLogin = async (userEmail: string) => {
    try {
      await yuleApi.requestMagicLink(userEmail);
      setSentMessage(`Sol·licitat accés per a ${userEmail}. Comprova el terminal del backend o el token generat.`);
    } catch {
      alert("Error en l'accés ràpid.");
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
    <Container maxWidth="xs" sx={{ mt: { xs: 4, md: 8 } }}>
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

      <Card sx={{ p: 3.5, border: '1.5px solid #d4af37' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            color: '#143226',
            mb: 1,
            textAlign: 'center',
          }}
        >
          Accés sense contrasenya
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
          Escriu el teu correu i rebràs un enllaç màgic per entrar amb 1 sol clic.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {sentMessage ? (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            {sentMessage}
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleRequestMagicLink}>
            <TextField
              label="El teu correu electrònic"
              type="email"
              placeholder="ex: monica@familia.cat"
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
              sx={{ py: 1.5, fontSize: '15px' }}
            >
              Rebre enllaç al meu correu ✉️
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 1.5 }}>
          💡 Accés ràpid per a proves de la família:
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleSimulateQuickLogin('pau@familia.cat')}
            sx={{ fontSize: '12px', color: '#1b4332' }}
          >
            👑 Pau (Administrador)
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleSimulateQuickLogin('monica@familia.cat')}
            sx={{ fontSize: '12px', color: '#1b4332' }}
          >
            👤 Mònica (Familiar)
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleSimulateQuickLogin('jordi.avi@familia.cat')}
            sx={{ fontSize: '12px', color: '#1b4332' }}
          >
            👴 Jordi Avi (Familiar)
          </Button>
        </Box>
      </Card>
    </Container>
  );
};
