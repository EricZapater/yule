import React, { useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Chip,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import StarIcon from '@mui/icons-material/Star';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useYuleStore } from '../store';

export const AppNavigation: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const {
    currentUser,
    myWishlist,
    isWishlistLoaded,
    fetchMyWishlist,
    fetchEdition,
    logout,
  } = useYuleStore();

  useEffect(() => {
    fetchMyWishlist();
    fetchEdition();
  }, [fetchMyWishlist, fetchEdition]);

  const currentTab = (() => {
    if (location.pathname.startsWith('/wishlist')) return '/wishlist';
    if (location.pathname.startsWith('/admin')) return '/admin';
    return '/';
  })();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f7f4ee',
      }}
    >
      {/* Top Navbar */}
      <AppBar
        position="sticky"
        sx={{
          background: 'linear-gradient(180deg, #143226 0%, #1b4332 100%)',
          borderBottom: '2px solid #d4af37',
        }}
        elevation={1}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            <Typography variant="h5" component="span" sx={{ fontSize: '28px' }}>
              🎄
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '1px',
              }}
            >
              YULE
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                color="inherit"
                onClick={() => navigate('/')}
                sx={{
                  color: currentTab === '/' ? '#e8c868' : '#d1dfd6',
                  fontWeight: currentTab === '/' ? 700 : 500,
                }}
              >
                🎁 El meu Amic Invisible
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/wishlist')}
                sx={{
                  color: currentTab === '/wishlist' ? '#e8c868' : '#d1dfd6',
                  fontWeight: currentTab === '/wishlist' ? 700 : 500,
                }}
              >
                ⭐ Els meus Desitjos
              </Button>
              {currentUser?.role === 'admin' && (
                <Button
                  color="inherit"
                  onClick={() => navigate('/admin')}
                  sx={{
                    color: currentTab === '/admin' ? '#e8c868' : '#d1dfd6',
                    fontWeight: currentTab === '/admin' ? 700 : 500,
                  }}
                >
                  ⚙️ Panell Admin
                </Button>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {currentUser && (
              <Chip
                label={currentUser.name}
                sx={{
                  bgcolor: 'rgba(212, 175, 55, 0.2)',
                  color: '#e8c868',
                  border: '1px solid #d4af37',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              />
            )}
            <Button
              size="small"
              onClick={logout}
              sx={{ minWidth: 'auto', p: 1, color: '#f7f4ee' }}
              title="Sortir"
            >
              <LogoutIcon fontSize="small" />
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Avís: Llista de desitjos buida pel sorteig actiu */}
      {isWishlistLoaded && myWishlist.length === 0 && !location.pathname.startsWith('/wishlist') && (
        <Box
          sx={{
            background: 'linear-gradient(90deg, #fff3cd 0%, #fef8e7 100%)',
            borderBottom: '2px solid #e0c870',
            px: { xs: 2, md: 4 },
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: '260px' }}>
            <Typography sx={{ fontSize: '24px' }}>🎁</Typography>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#855904', lineHeight: 1.3 }}>
                Avís: Encara no has afegit cap desig a la teva llista de regals!
              </Typography>
              <Typography variant="caption" sx={{ color: '#6d4803', display: 'block' }}>
                Perquè el teu amic invisible sàpiga què regalar-te, afegeix idees o fotos pel sorteig d'aquest any.
              </Typography>
            </Box>
          </Box>
          <Button
            size="small"
            variant="contained"
            onClick={() => navigate('/wishlist')}
            sx={{
              bgcolor: '#9d0208',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              px: 2.5,
              py: 0.75,
              borderRadius: 2,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(157, 2, 8, 0.3)',
              '&:hover': { bgcolor: '#7b0005' },
            }}
          >
            ✨ Omplir la meva llista
          </Button>
        </Box>
      )}

      {/* Main Content Area */}
      <Box sx={{ flex: 1, pb: isMobile ? '80px' : 4 }}>{children}</Box>

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            borderTop: '1px solid #e5ded0',
            zIndex: 1000,
          }}
          elevation={4}
        >
          <BottomNavigation
            showLabels
            value={currentTab}
            onChange={(_, newValue) => navigate(newValue)}
            sx={{
              height: 64,
              '& .Mui-selected': {
                color: '#9d0208 !important',
                fontWeight: 700,
              },
            }}
          >
            <BottomNavigationAction
              label="A qui regalo"
              value="/"
              icon={<CardGiftcardIcon />}
            />
            <BottomNavigationAction
              label="Els meus desitjos"
              value="/wishlist"
              icon={<StarIcon />}
            />
            {currentUser?.role === 'admin' && (
              <BottomNavigationAction
                label="Admin"
                value="/admin"
                icon={<SettingsIcon />}
              />
            )}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};
