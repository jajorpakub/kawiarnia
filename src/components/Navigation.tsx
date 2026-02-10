import React from 'react';
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
  Box
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Calculate as CalculateIcon,
  People as PeopleIcon,
  Kitchen as KitchenIcon,
  Assignment as AssignmentIcon,
  Coffee as CoffeeIcon,
  AccountBalance as AccountBalanceIcon,
  Event as EventIcon,
  BorderColor as BorderColorIcon,
  LocationOn as LocationIcon,
  RestaurantMenu as MenuIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  { text: 'Panel główny', icon: <DashboardIcon />, path: '/' },
  { text: 'Lokale', icon: <LocationIcon />, path: '/lokale' },
  { text: 'Menu', icon: <MenuIcon />, path: '/menu' },
  { text: 'Procurement', icon: <CalculateIcon />, path: '/procurement' },
  { text: 'Zadania', icon: <AssignmentIcon />, path: '/zadania' },
  { text: 'Kredyty/Dofinansowanie', icon: <AccountBalanceIcon />, path: '/finansowanie' },
  { text: 'Kalendarz', icon: <EventIcon />, path: '/kalendarz' },
  { text: 'Tablica', icon: <BorderColorIcon />, path: '/tablica' },
];

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CoffeeIcon color="primary" />
          <Typography variant="h6" noWrap component="div" color="primary">
            Kawiarnia Manager
          </Typography>
        </Box>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Navigation;
