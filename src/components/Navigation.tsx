import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
  AppBar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Calculate as CalculateIcon,
  Assignment as AssignmentIcon,
  Coffee as CoffeeIcon,
  AccountBalance as AccountBalanceIcon,
  Event as EventIcon,
  BorderColor as BorderColorIcon,
  LocationOn as LocationIcon,
  RestaurantMenu as MenuIcon,
  Menu as MenuIconOpen,
  Close as CloseIcon
} from '@mui/icons-material';

const drawerWidth = 260;

const menuItems = [
  { text: 'Panel główny', icon: <DashboardIcon />, path: '/', color: '#4CAF50' },
  { text: 'Lokale', icon: <LocationIcon />, path: '/lokale', color: '#FF5722' },
  { text: 'Menu', icon: <MenuIcon />, path: '/menu', color: '#E91E63' },
  { text: 'Procurement', icon: <CalculateIcon />, path: '/procurement', color: '#2196F3' },
  { text: 'Zadania', icon: <AssignmentIcon />, path: '/zadania', color: '#FF9800' },
  { text: 'Kredyty/Dofinansowanie', icon: <AccountBalanceIcon />, path: '/finansowanie', color: '#00897B' },
  { text: 'Kalendarz', icon: <EventIcon />, path: '/kalendarz', color: '#FF6B6B' },
  { text: 'Tablica', icon: <BorderColorIcon />, path: '/tablica', color: '#9C27B0' },
];

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const drawerContent = (
    <>
      {/* Header */}
      <Toolbar
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '20px 16px',
          minHeight: isMobile ? '100px' : '120px',
          background: 'linear-gradient(135deg, #4CAF5015 0%, #4CAF5008 100%)',
          borderBottom: '1px solid #4CAF5030',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              backgroundColor: '#4CAF5020',
              borderRadius: '8px',
              color: '#4CAF50'
            }}
          >
            <CoffeeIcon sx={{ fontSize: '1.5rem' }} />
          </Box>
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.75rem',
                color: '#b0b0b0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600
              }}
            >
              Kawiarnia
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#e0e0e0'
              }}
            >
              Manager
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      <Divider sx={{ borderColor: '#2a2a2a' }} />

      {/* Navigation Items */}
      <List sx={{ p: '12px 8px', flex: 1 }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                selected={active}
                sx={{
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  backgroundColor: active ? `${item.color}15` : 'transparent',
                  border: active ? `1px solid ${item.color}30` : '1px solid transparent',
                  color: active ? item.color : '#b0b0b0',
                  '&:hover': {
                    backgroundColor: `${item.color}12`,
                    border: `1px solid ${item.color}30`,
                    color: item.color,
                    transform: 'translateX(4px)'
                  },
                  '& .MuiListItemIcon-root': {
                    color: active ? item.color : '#b0b0b0',
                    minWidth: '40px',
                    transition: 'color 0.3s ease'
                  },
                  '& .MuiListItemText-primary': {
                    fontSize: '0.9rem',
                    fontWeight: active ? 600 : 500,
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                {active && (
                  <Box
                    sx={{
                      width: '3px',
                      height: '20px',
                      backgroundColor: item.color,
                      borderRadius: '2px',
                      ml: 1
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Divider sx={{ borderColor: '#2a2a2a' }} />
      <Box
        sx={{
          padding: '16px',
          textAlign: 'center',
          borderTop: '1px solid #2a2a2a'
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: '#707070',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: 600
          }}
        >
          v1.0.0
        </Typography>
      </Box>
    </>
  );

  // Mobile: AppBar + Drawer
  if (isMobile) {
    return (
      <>
        <AppBar
          position="fixed"
          sx={{
            backgroundColor: '#1a1a1a',
            borderBottom: '1px solid #2a2a2a',
            boxShadow: 'none',
            zIndex: theme.zIndex.drawer + 1
          }}
        >
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CoffeeIcon sx={{ color: '#4CAF50', fontSize: '1.5rem' }} />
              <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#e0e0e0' }}>
                Manager
              </Typography>
            </Box>
            <IconButton
              color="inherit"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ color: '#4CAF50' }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIconOpen />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            width: 260,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: 260,
              boxSizing: 'border-box',
              backgroundColor: '#1a1a1a',
              borderRight: '1px solid #2a2a2a',
              marginTop: '56px'
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </>
    );
  }

  // Desktop: Permanent Drawer
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 260,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 260,
          boxSizing: 'border-box',
          backgroundColor: '#1a1a1a',
          borderRight: '1px solid #2a2a2a',
          transition: 'all 0.3s ease'
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Navigation;