import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { useMediaQuery, useTheme } from '@mui/material';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import CostEstimates from './pages/CostEstimates';
import Suppliers from './pages/Suppliers';
import Equipment from './pages/Equipment';
import Tasks from './pages/Tasks';
import Financing from './pages/Financing';
import Calendar from './pages/Calendar';
import Whiteboard from './pages/Whiteboard';
import Locations from './pages/Locations';
import Menu from './pages/Menu';
import Procurement from './pages/Procurement';
import { FirebaseProvider } from './context/FirebaseContext';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    primary: { main: '#8B4513' },
    secondary: { main: '#D2691E' },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const appTheme = useTheme();
  const isMobile = useMediaQuery(appTheme.breakpoints.down('md'));

  return (
    <FirebaseProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Navigation />
            <Box 
              component="main" 
              sx={{ 
                flexGrow: 1, 
                p: isMobile ? 2 : 3,
                pt: isMobile ? '80px' : 3,
                width: '100%',
                overflow: 'auto'
              }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/lokale" element={<Locations />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/procurement" element={<Procurement />} />
                <Route path="/kosztorysy" element={<CostEstimates />} />
                <Route path="/dostawcy" element={<Suppliers />} />
                <Route path="/wyposazenie" element={<Equipment />} />
                <Route path="/zadania" element={<Tasks />} />
                <Route path="/finansowanie" element={<Financing />} />
                <Route path="/kalendarz" element={<Calendar />} />
                <Route path="/tablica" element={<Whiteboard />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
    </FirebaseProvider>
  );
}

export default App;
