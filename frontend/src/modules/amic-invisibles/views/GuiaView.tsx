import React from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  Button,
  Grid,
  Chip,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PrintIcon from '@mui/icons-material/Print';
import { useNavigate } from 'react-router-dom';

export const GuiaView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 2.5, md: 4 }, mb: 8 }}>
      {/* Botons superiors de navegació i descàrrega */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 1.5,
          '@media print': { display: 'none' },
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/login')}
          variant="outlined"
          sx={{ borderColor: '#1b4332', color: '#1b4332', fontWeight: 700 }}
        >
          Tornar a l'inici / Login
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            variant="outlined"
            sx={{ borderColor: '#d4af37', color: '#7a5300', fontWeight: 600 }}
          >
            Imprimir
          </Button>

          <Button
            startIcon={<PictureAsPdfIcon />}
            component="a"
            href="/guia-familiar.pdf"
            download="Guia_Familiar_Amic_Invisible.pdf"
            variant="contained"
            sx={{
              bgcolor: '#1b4332',
              color: '#ffffff',
              fontWeight: 700,
              '&:hover': { bgcolor: '#2d6a4f' },
            }}
          >
            Descarregar PDF 📄
          </Button>
        </Box>
      </Box>

      {/* Capçalera de la Guia */}
      <Card
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 3,
          border: '2px solid #d4af37',
          background: 'radial-gradient(circle at 100% 0%, #fffdf8 0%, #ffffff 80%)',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" sx={{ fontSize: '48px', mb: 1 }}>
          🎄
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 800,
            color: '#1b4332',
            letterSpacing: '0.5px',
            mb: 1,
          }}
        >
          GUIA DE L'AMIC INVISIBLE
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
          Instruccions senzilles pas a pas per a familiars: com entrar, com indicar els teus regals i com descobrir el teu amic invisible.
        </Typography>
      </Card>

      {/* =========================================================================
          PAS 1: REGISTRE INICIAL
          ========================================================================= */}
      <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 4, borderRadius: 3, border: '1px solid #ebd8b2' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Chip label="PAS 1" color="primary" sx={{ fontWeight: 800, bgcolor: '#1b4332' }} />
          <Typography variant="h5" sx={{ fontFamily: "'Cinzel', serif", fontWeight: 700, color: '#143226' }}>
            Com registrar-se per primera vegada
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ color: '#334155', mb: 2, lineHeight: 1.7 }}>
          Si és la primera vegada que entres per al sorteig d'aquest any, <strong>no cal crear cap contrasenya</strong>:
        </Typography>

        <Box component="ol" sx={{ pl: 3, mb: 2.5, color: '#475569', lineHeight: 1.8 }}>
          <li>Entra a <strong>https://yule.ericzapater.cat/login</strong> des del mòbil o l'ordinador.</li>
          <li>Assegura't que estàs a la pestanya <strong>"Registra't 🎁"</strong>.</li>
          <li>Escriu el teu <strong>nom o sobrenom</strong> (ex: <em>Maria</em>, <em>Oncle Joan</em>, <em>Avi Jordi</em>...).</li>
          <li>Introdueix la teva adreça de <strong>correu electrònic</strong>.</li>
          <li>Prem el botó verd <strong>"Uneix-te a l'Amic Invisible 🎄"</strong>.</li>
        </Box>

        <Box
          component="img"
          src="/guide/opt/01_registre.jpg"
          alt="Pantalla de registre d'un familiar"
          sx={{
            width: '100%',
            maxWidth: '520px',
            display: 'block',
            mx: 'auto',
            borderRadius: 2,
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            mb: 2,
          }}
        />

        <Alert severity="success" sx={{ borderRadius: 2 }}>
          🎉 <strong>A punt!</strong> Un cop premut el botó, entraràs directament al teu panell personal.
        </Alert>
      </Card>

      {/* =========================================================================
          PAS 2: ACCÉS SENSE CONTRASENYES
          ========================================================================= */}
      <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 4, borderRadius: 3, border: '1px solid #ebd8b2' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Chip label="PAS 2" color="primary" sx={{ fontWeight: 800, bgcolor: '#1b4332' }} />
          <Typography variant="h5" sx={{ fontFamily: "'Cinzel', serif", fontWeight: 700, color: '#143226' }}>
            Com tornar a entrar més endavant (Sense contrasenyes)
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ color: '#334155', mb: 2, lineHeight: 1.7 }}>
          Si tanques la sessió o canvies de dispositiu, pots tornar a accedir fàcilment amb qualsevol d'aquestes dues opcions:
        </Typography>

        <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 2, bgcolor: '#faf7f2', borderRadius: 2, border: '1px solid #ebd8b2', height: '100%' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1b4332', mb: 1 }}>
                📨 Opció A: Enllaç directe per correu
              </Typography>
              <Typography variant="body2" color="text.secondary">
                A la pestanya <strong>"Ja tens compte 🔑"</strong>, escriu el teu correu i prem <em>"Enviar enllaç d'accés màgic"</em>. Rebràs un correu amb un botó per entrar amb un sol clic.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0', height: '100%' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#166534', mb: 1 }}>
                📲 Opció B: Enllaç per WhatsApp (El més ràpid!)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                L'administrador de la família et pot compartir el teu enllaç personalitzat directament per WhatsApp. Fent-hi clic des del mòbil entraràs a l'instant!
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box
          component="img"
          src="/guide/opt/02_magic_link.jpg"
          alt="Pantalla d'accés màgic per correu"
          sx={{
            width: '100%',
            maxWidth: '520px',
            display: 'block',
            mx: 'auto',
            borderRadius: 2,
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
          }}
        />
      </Card>

      {/* =========================================================================
          PAS 3: OMPLIR LA LLISTA DE DESITJOS
          ========================================================================= */}
      <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 4, borderRadius: 3, border: '1px solid #ebd8b2' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Chip label="PAS 3" color="primary" sx={{ fontWeight: 800, bgcolor: '#1b4332' }} />
          <Typography variant="h5" sx={{ fontFamily: "'Cinzel', serif", fontWeight: 700, color: '#143226' }}>
            Com preparar la teva llista de desitjos 🎁
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ color: '#334155', mb: 2, lineHeight: 1.7 }}>
          En entrar a l'app, veuràs un avís si encara no has desat cap regal. Prem <strong>"📝 Crear la meva llista de desitjos"</strong> per començar a afegir idees:
        </Typography>

        <Box
          component="img"
          src="/guide/opt/03_panell_familiar.jpg"
          alt="Pantalla principal del familiar"
          sx={{
            width: '100%',
            maxWidth: '680px',
            display: 'block',
            mx: 'auto',
            borderRadius: 2,
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            mb: 3,
          }}
        />

        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1b4332', mb: 1.5 }}>
          Informació que pots afegir a cada regal:
        </Typography>

        <Box component="ul" sx={{ pl: 3, mb: 2.5, color: '#475569', lineHeight: 1.8 }}>
          <li><strong>Títol del regal (obligatori)</strong>: El producte que t'agradaria (ex: <em>Llibre de cuina</em>, <em>Bufanda de llana</em>, <em>Joc de taula</em>...).</li>
          <li><strong>Preu orientatiu (€)</strong>: Per ajudar la persona que et regali a mantenir-se dins del pressupost acordat (ex: 30 €).</li>
          <li><strong>Enllaç web (opcional)</strong>: L'enllaç de la botiga o d'Amazon per comprar-lo online amb un sol clic.</li>
          <li><strong>Talla o detalls (opcional)</strong>: La teva talla de roba/calçat, color preferit o la botiga física on ho has vist.</li>
          <li>
            <strong>Fotos del regal (Molt recomanat!)</strong>:
            <Box component="ul" sx={{ pl: 2.5, mt: 0.5 }}>
              <li>📸 <strong>Fer Foto (Càmera)</strong>: Obre la càmera del mòbil per fer una foto a l'etiqueta o producte directament a la botiga.</li>
              <li>🖼️ <strong>Tria de la Galeria</strong>: Permet triar una foto o captura de pantalla que ja tinguis al mòbil.</li>
            </Box>
          </li>
        </Box>

        <Box
          component="img"
          src="/guide/opt/04_afegir_desig_modal.jpg"
          alt="Formulari per afegir una idea de regal"
          sx={{
            width: '100%',
            maxWidth: '680px',
            display: 'block',
            mx: 'auto',
            borderRadius: 2,
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            mb: 2,
          }}
        />

        <Alert severity="info" sx={{ borderRadius: 2 }}>
          💡 <strong>Ja vas participar l'any anterior?</strong> Pots prémer el botó <strong>"Traspassar Desitjos de l'Any Anterior"</strong> per importar tots els teus regals automàticament sense haver-los de tornar a escriure.
        </Alert>
      </Card>

      {/* =========================================================================
          PAS 4: EL SORTEIG I QUÈ REBRÀS
          ========================================================================= */}
      <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 4, borderRadius: 3, border: '1px solid #ebd8b2' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Chip label="PAS 4" color="primary" sx={{ fontWeight: 800, bgcolor: '#1b4332' }} />
          <Typography variant="h5" sx={{ fontFamily: "'Cinzel', serif", fontWeight: 700, color: '#143226' }}>
            El sorteig: Què rebràs quan se celebri? 🎉
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ color: '#334155', mb: 2, lineHeight: 1.7 }}>
          Quan tots els familiars hagin preparat les seves llistes i l'administrador celebri el sorteig:
        </Typography>

        <Box sx={{ p: 2.5, bgcolor: '#faf7f2', borderRadius: 2, border: '1px solid #ebd8b2', mb: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1b4332', mb: 1 }}>
            📬 1. Rebràs un correu electrònic festiu
          </Typography>
          <Typography variant="body2" sx={{ color: '#475569', mb: 1.5 }}>
            A la teva bústia rebràs el missatge oficial del sorteig amb:
          </Typography>
          <Box component="ul" sx={{ pl: 3, m: 0, color: '#475569', fontSize: '14px', lineHeight: 1.8 }}>
            <li>El nom secret de la persona que t'ha tocat (ex: <strong>T'ha tocat fer el regal a en Joan! 🎁</strong>).</li>
            <li>El pressupost màxim acordat per la família.</li>
            <li><strong>La llista de desitjos d'en Joan amb totes les fotos, preus i enllaços directament al correu</strong> perquè no t'hagis de preocupar si no recordes la contrasenya.</li>
          </Box>
        </Box>

        <Box sx={{ p: 2.5, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#166534', mb: 1 }}>
            📱 2. A l'aplicació web
          </Typography>
          <Typography variant="body2" sx={{ color: '#475569' }}>
            En tornar a entrar a l'app, veuràs la targeta secreta del teu destinatari amb caselles per <strong>marcar de manera privada els regals que ja hagis comprat</strong>, per no oblidar-te'n i organitzar-te tranquil·lament les compres!
          </Typography>
        </Box>
      </Card>

      {/* Botó final d'acció */}
      <Box sx={{ textAlign: 'center', mt: 4, '@media print': { display: 'none' } }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/login')}
          sx={{
            py: 1.8,
            px: 4,
            fontSize: '16px',
            fontWeight: 800,
            bgcolor: '#1b4332',
            '&:hover': { bgcolor: '#2d6a4f' },
          }}
        >
          Anar a l'Amic Invisible 🎄
        </Button>
      </Box>
    </Container>
  );
};
