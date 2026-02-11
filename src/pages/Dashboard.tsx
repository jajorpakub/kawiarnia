import React, { useState } from 'react';
import { 
  Card, CardContent, CardHeader, Typography, Box, 
  Collapse, IconButton, Table, TableBody, TableCell, TableHead, TableRow,
  Chip, TableContainer, Paper
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { TrendingUp, AttachMoney, ShoppingCart, AssignmentTurnedIn, ExpandMore, AccountBalance, Event as EventIcon, LocationOn, RestaurantMenu } from '@mui/icons-material';
import { useFirebase } from '../context/FirebaseContext';

const Dashboard: React.FC = () => {
  const { costEstimates, equipment, tasks, suppliers, financing, events, locations, menuItems } = useFirebase();
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});

  const totalBudget = costEstimates.reduce((sum, item) => sum + item.total, 0);
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const approvedFinancing = financing.reduce((sum, item) => sum + (item.approvedAmount || 0), 0);
  const upcomingEvents = events.filter(e => new Date(e.startDate) > new Date()).length;

  const toggleExpand = (cardKey: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'done':
      case 'received':
        return 'success';
      case 'in-progress':
      case 'ordered':
        return 'warning';
      case 'todo':
      case 'pending':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status?: string) => {
    const labels: { [key: string]: string } = {
      'done': 'Ukończone',
      'in-progress': 'W trakcie',
      'todo': 'Do zrobienia',
      'received': 'Otrzymane',
      'ordered': 'Zamówione',
      'pending': 'Oczekujące'
    };
    return labels[status || 'default'] || status || 'Brak statusu';
  };

  const CompactTable = ({ color, children }: any) => (
    <TableContainer component={Paper} sx={{ 
      bgcolor: 'transparent', 
      boxShadow: 'none',
      overflow: 'visible'
    }}>
      <Table size="small" sx={{ 
        width: '100%',
        '& .MuiTableCell-root': {
          padding: '5px 6px',
          fontSize: '0.7rem',
          height: '28px'
        }
      }}>
        {children}
      </Table>
    </TableContainer>
  );

  const StyledTableHead = ({ color, children }: any) => (
    <TableHead>
      <TableRow sx={{ 
        backgroundColor: `${color}15`, 
        borderBottom: `2px solid ${color}30`,
        height: '28px'
      }}>
        {children}
      </TableRow>
    </TableHead>
  );

  const StyledHeaderCell = ({ color, children }: any) => (
    <TableCell sx={{ 
      color, 
      fontWeight: 600, 
      fontSize: '0.65rem', 
      textTransform: 'uppercase', 
      letterSpacing: '0.3px',
      padding: '5px 6px',
      height: '28px'
    }}>
      {children}
    </TableCell>
  );

  const StyledDataCell = ({ color, align, weight, children }: any) => (
    <TableCell align={align} sx={{ 
      color: color || '#e0e0e0', 
      fontWeight: weight || 400,
      padding: '5px 6px',
      fontSize: '0.7rem',
      height: '28px'
    }}>
      {children}
    </TableCell>
  );

  const StatCard = ({ icon, title, value, color, expanded, onToggle, expandContent }: any) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
        border: `1px solid ${color}30`,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: `0 8px 24px ${color}20`,
          transform: 'translateY(-2px)',
          border: `1px solid ${color}50`
        }
      }}
    >
      <CardHeader
        avatar={<Box sx={{ color, fontSize: 28 }}>{icon}</Box>}
        title={<Typography sx={{ fontSize: '0.95rem', fontWeight: 500, color: '#e0e0e0' }}>{title}</Typography>}
        action={
          <IconButton
            onClick={() => onToggle()}
            size="small"
            sx={{
              color,
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s'
            }}
          >
            <ExpandMore />
          </IconButton>
        }
        sx={{ pb: 0.5, pt: 1 }}
      />
      <CardContent sx={{ flexGrow: 1, pt: 0.5, pb: 0 }}>
        <Typography
          variant="h4"
          sx={{
            color,
            fontWeight: 700,
            fontSize: '2rem',
            mb: 0
          }}
        >
          {value}
        </Typography>
      </CardContent>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 1, pb: 1, borderTop: `1px solid ${color}20` }}>
          {expandContent}
        </CardContent>
      </Collapse>
    </Card>
  );

  const stats = [
    {
      key: 'budget',
      title: 'Szacowany budżet',
      value: `${totalBudget.toFixed(2)} zł`,
      icon: <AttachMoney />,
      color: '#4CAF50',
      expandContent: (
        <CompactTable color="#4CAF50">
          <StyledTableHead color="#4CAF50">
            <StyledHeaderCell color="#4CAF50">Nazwa</StyledHeaderCell>
            <StyledHeaderCell color="#4CAF50">Ilość</StyledHeaderCell>
            <StyledHeaderCell color="#4CAF50">Cena</StyledHeaderCell>
            <StyledHeaderCell color="#4CAF50">Razem</StyledHeaderCell>
          </StyledTableHead>
          <TableBody>
            {costEstimates.slice(0, 5).map((item, idx) => (
              <TableRow key={item.id} sx={{ 
                backgroundColor: idx % 2 === 0 ? '#ffffff08' : 'transparent',
                borderBottom: '1px solid #ffffff10',
                transition: 'all 0.2s ease',
                '&:hover': { backgroundColor: '#4CAF5012' },
                height: '28px'
              }}>
                <StyledDataCell color="#e0e0e0" weight={500}>{item.name}</StyledDataCell>
                <StyledDataCell color="#b0b0b0" align="right">{item.quantity}</StyledDataCell>
                <StyledDataCell color="#b0b0b0" align="right">{item.unitPrice.toFixed(2)} zł</StyledDataCell>
                <StyledDataCell color="#4CAF50" weight={600} align="right">{item.total.toFixed(2)} zł</StyledDataCell>
              </TableRow>
            ))}
          </TableBody>
        </CompactTable>
      )
    },
    {
      key: 'equipment',
      title: 'Wyposażenie',
      value: `${equipment.length}`,
      icon: <ShoppingCart />,
      color: '#2196F3',
      expandContent: (
        <CompactTable color="#2196F3">
          <StyledTableHead color="#2196F3">
            <StyledHeaderCell color="#2196F3">Nazwa</StyledHeaderCell>
            <StyledHeaderCell color="#2196F3">Ilość</StyledHeaderCell>
            <StyledHeaderCell color="#2196F3">Status</StyledHeaderCell>
          </StyledTableHead>
          <TableBody>
            {equipment.slice(0, 5).map((item, idx) => (
              <TableRow key={item.id} sx={{ 
                backgroundColor: idx % 2 === 0 ? '#ffffff08' : 'transparent',
                borderBottom: '1px solid #ffffff10',
                transition: 'all 0.2s ease',
                '&:hover': { backgroundColor: '#2196F312' },
                height: '28px'
              }}>
                <StyledDataCell color="#e0e0e0" weight={500}>{item.name}</StyledDataCell>
                <StyledDataCell color="#b0b0b0" align="right">{item.quantity}</StyledDataCell>
                <StyledDataCell align="right" sx={{ padding: '4px 6px' }}>
                  <Chip label={getStatusLabel(item.status)} size="small" color={getStatusColor(item.status)} sx={{ height: '18px', fontSize: '0.6rem' }} />
                </StyledDataCell>
              </TableRow>
            ))}
          </TableBody>
        </CompactTable>
      )
    },
    {
      key: 'tasks',
      title: 'Zadania',
      value: `${completedTasks}/${totalTasks}`,
      icon: <AssignmentTurnedIn />,
      color: '#FF9800',
      expandContent: (
        <CompactTable color="#FF9800">
          <StyledTableHead color="#FF9800">
            <StyledHeaderCell color="#FF9800">Zadanie</StyledHeaderCell>
            <StyledHeaderCell color="#FF9800">Status</StyledHeaderCell>
          </StyledTableHead>
          <TableBody>
            {tasks.slice(0, 5).map((task, idx) => (
              <TableRow key={task.id} sx={{ 
                backgroundColor: idx % 2 === 0 ? '#ffffff08' : 'transparent',
                borderBottom: '1px solid #ffffff10',
                transition: 'all 0.2s ease',
                '&:hover': { backgroundColor: '#FF980012' },
                height: '28px'
              }}>
                <StyledDataCell color="#e0e0e0" weight={500}>{task.title}</StyledDataCell>
                <StyledDataCell align="right" sx={{ padding: '4px 6px' }}>
                  <Chip label={getStatusLabel(task.status)} size="small" color={getStatusColor(task.status)} sx={{ height: '18px', fontSize: '0.6rem' }} />
                </StyledDataCell>
              </TableRow>
            ))}
          </TableBody>
        </CompactTable>
      )
    },
    {
      key: 'suppliers',
      title: 'Dostawcy',
      value: `${suppliers.length}`,
      icon: <TrendingUp />,
      color: '#9C27B0',
      expandContent: (
        <CompactTable color="#9C27B0">
          <StyledTableHead color="#9C27B0">
            <StyledHeaderCell color="#9C27B0">Nazwa</StyledHeaderCell>
            <StyledHeaderCell color="#9C27B0">Kontakt</StyledHeaderCell>
          </StyledTableHead>
          <TableBody>
            {suppliers.slice(0, 5).map((supplier, idx) => (
              <TableRow key={supplier.id} sx={{ 
                backgroundColor: idx % 2 === 0 ? '#ffffff08' : 'transparent',
                borderBottom: '1px solid #ffffff10',
                transition: 'all 0.2s ease',
                '&:hover': { backgroundColor: '#9C27B012' },
                height: '28px'
              }}>
                <StyledDataCell color="#e0e0e0" weight={500}>{supplier.name}</StyledDataCell>
                <StyledDataCell color="#b0b0b0" align="right">{supplier.phone}</StyledDataCell>
              </TableRow>
            ))}
          </TableBody>
        </CompactTable>
      )
    },
    {
      key: 'financing',
      title: 'Finansowanie',
      value: `${approvedFinancing.toFixed(2)} zł`,
      icon: <AccountBalance />,
      color: '#00897B',
      expandContent: (
        <CompactTable color="#00897B">
          <StyledTableHead color="#00897B">
            <StyledHeaderCell color="#00897B">Nazwa</StyledHeaderCell>
            <StyledHeaderCell color="#00897B">Kwota (zł)</StyledHeaderCell>
            <StyledHeaderCell color="#00897B">Status</StyledHeaderCell>
          </StyledTableHead>
          <TableBody>
            {financing.slice(0, 5).map((item, idx) => (
              <TableRow key={item.id} sx={{ 
                backgroundColor: idx % 2 === 0 ? '#ffffff08' : 'transparent',
                borderBottom: '1px solid #ffffff10',
                transition: 'all 0.2s ease',
                '&:hover': { backgroundColor: '#00897B12' },
                height: '28px'
              }}>
                <StyledDataCell color="#e0e0e0" weight={500}>{item.name}</StyledDataCell>
                <StyledDataCell color="#b0b0b0" align="right">{item.amount.toFixed(2)}</StyledDataCell>
                <StyledDataCell align="right" sx={{ padding: '4px 6px' }}>
                  <Chip label={getStatusLabel(item.status)} size="small" color={getStatusColor(item.status)} sx={{ height: '18px', fontSize: '0.6rem' }} />
                </StyledDataCell>
              </TableRow>
            ))}
          </TableBody>
        </CompactTable>
      )
    },
    {
      key: 'calendar',
      title: 'Zdarzenia',
      value: `${upcomingEvents}`,
      icon: <EventIcon />,
      color: '#FF6B6B',
      expandContent: (
        <CompactTable color="#FF6B6B">
          <StyledTableHead color="#FF6B6B">
            <StyledHeaderCell color="#FF6B6B">Tytuł</StyledHeaderCell>
            <StyledHeaderCell color="#FF6B6B">Data</StyledHeaderCell>
          </StyledTableHead>
          <TableBody>
            {events
              .filter(e => new Date(e.startDate) > new Date())
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .slice(0, 5)
              .map((event, idx) => (
                <TableRow key={event.id} sx={{ 
                  backgroundColor: idx % 2 === 0 ? '#ffffff08' : 'transparent',
                  borderBottom: '1px solid #ffffff10',
                  transition: 'all 0.2s ease',
                  '&:hover': { backgroundColor: '#FF6B6B12' },
                  height: '28px'
                }}>
                  <StyledDataCell color="#e0e0e0" weight={500}>{event.title}</StyledDataCell>
                  <StyledDataCell color="#b0b0b0" align="right">
                    {new Date(event.startDate).toLocaleDateString('pl-PL')}
                  </StyledDataCell>
                </TableRow>
              ))}
          </TableBody>
        </CompactTable>
      )
    },
    {
      key: 'locations',
      title: 'Lokale',
      value: `${locations.length}`,
      icon: <LocationOn />,
      color: '#FF5722',
      expandContent: (
        <CompactTable color="#FF5722">
          <StyledTableHead color="#FF5722">
            <StyledHeaderCell color="#FF5722">Ulica</StyledHeaderCell>
            <StyledHeaderCell color="#FF5722">m²</StyledHeaderCell>
            <StyledHeaderCell color="#FF5722">Status</StyledHeaderCell>
          </StyledTableHead>
          <TableBody>
            {locations.slice(0, 5).map((location, idx) => (
              <TableRow key={location.id} sx={{ 
                backgroundColor: idx % 2 === 0 ? '#ffffff08' : 'transparent',
                borderBottom: '1px solid #ffffff10',
                transition: 'all 0.2s ease',
                '&:hover': { backgroundColor: '#FF572212' },
                height: '28px'
              }}>
                <StyledDataCell color="#e0e0e0" weight={500}>{location.street}</StyledDataCell>
                <StyledDataCell color="#b0b0b0" align="right">{location.squareMeters}</StyledDataCell>
                <StyledDataCell align="right" sx={{ padding: '4px 6px' }}>
                  <Chip 
                    label={location.status === 'interested' ? 'Zaint.' : location.status === 'negotiating' ? 'Negoj.' : location.status === 'viewing' ? 'Ogląd.' : 'Odrz.'} 
                    size="small" 
                    color={location.status === 'interested' || location.status === 'negotiating' ? 'success' : 'default'} 
                    sx={{ height: '18px', fontSize: '0.6rem' }}
                  />
                </StyledDataCell>
              </TableRow>
            ))}
          </TableBody>
        </CompactTable>
      )
    },
    {
      key: 'menu',
      title: 'Menu',
      value: `${menuItems.length}`,
      icon: <RestaurantMenu />,
      color: '#E91E63',
      expandContent: (
        <CompactTable color="#E91E63">
          <StyledTableHead color="#E91E63">
            <StyledHeaderCell color="#E91E63">Nazwa</StyledHeaderCell>
            <StyledHeaderCell color="#E91E63">Kat.</StyledHeaderCell>
            <StyledHeaderCell color="#E91E63">Typ</StyledHeaderCell>
          </StyledTableHead>
          <TableBody>
            {menuItems.slice(0, 5).map((item, idx) => (
              <TableRow key={item.id} sx={{ 
                backgroundColor: idx % 2 === 0 ? '#ffffff08' : 'transparent',
                borderBottom: '1px solid #ffffff10',
                transition: 'all 0.2s ease',
                '&:hover': { backgroundColor: '#E91E6312' },
                height: '28px'
              }}>
                <StyledDataCell color="#e0e0e0" weight={500}>{item.name}</StyledDataCell>
                <StyledDataCell color="#b0b0b0">
                  {item.category === 'beverage' ? 'Napój' : 
                   item.category === 'dessert' ? 'Deser' : 
                   item.category === 'snack' ? 'Prz.' : 
                   item.category === 'main' ? 'Główne' :
                   item.category === 'breakfast' ? 'Śniad.' : 'Inn.'}
                </StyledDataCell>
                <StyledDataCell color="#b0b0b0">
                  {item.dietary === 'vegan' ? '🌱' : item.dietary === 'vegetarian' ? '🥗' : '-'}
                </StyledDataCell>
              </TableRow>
            ))}
          </TableBody>
        </CompactTable>
      )
    }
  ];

  return (
    <Box sx={{ p: 4, maxWidth: '1600px', mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#e0e0e0' }}>
          Panel główny
        </Typography>
        <Typography variant="body1" sx={{ color: '#b0b0b0' }}>
          Przygotowania do otwarcia kawiarni
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid key={stat.key} size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
              color={stat.color}
              expanded={expandedCards[stat.key]}
              onToggle={() => toggleExpand(stat.key)}
              expandContent={stat.expandContent}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;