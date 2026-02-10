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
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ flexGrow: 1, pt: 1 }}>
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
        <CardContent sx={{ pt: 2, borderTop: `1px solid ${color}20` }}>
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
        <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
          <Table size="small" sx={{ '& tbody tr:hover': { bgcolor: '#2a2a2a' } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#2a2a2a' }}>
                <TableCell sx={{ color: '#e0e0e0' }}>Nazwa</TableCell>
                <TableCell align="right" sx={{ color: '#e0e0e0' }}>Ilość</TableCell>
                <TableCell align="right" sx={{ color: '#e0e0e0' }}>Cena</TableCell>
                <TableCell align="right" sx={{ color: '#e0e0e0' }}>Razem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {costEstimates.slice(0, 5).map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={{ color: '#e0e0e0' }}>{item.name}</TableCell>
                  <TableCell align="right" sx={{ color: '#e0e0e0' }}>{item.quantity}</TableCell>
                  <TableCell align="right" sx={{ color: '#e0e0e0' }}>{item.unitPrice.toFixed(2)} zł</TableCell>
                  <TableCell align="right" sx={{ color: '#e0e0e0' }}>{item.total.toFixed(2)} zł</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )
    },
    {
      key: 'equipment',
      title: 'Wyposażenie',
      value: `${equipment.length}`,
      icon: <ShoppingCart />,
      color: '#2196F3',
      expandContent: (
        <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
          <Table size="small" sx={{ '& tbody tr:hover': { bgcolor: '#2a2a2a' } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#2a2a2a' }}>
                <TableCell sx={{ color: '#e0e0e0' }}>Nazwa</TableCell>
                <TableCell align="right" sx={{ color: '#e0e0e0' }}>Ilość</TableCell>
                <TableCell align="right" sx={{ color: '#e0e0e0' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {equipment.slice(0, 5).map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={{ color: '#e0e0e0' }}>{item.name}</TableCell>
                  <TableCell align="right" sx={{ color: '#e0e0e0' }}>{item.quantity}</TableCell>
                  <TableCell align="right">
                    <Chip label={getStatusLabel(item.status)} size="small" color={getStatusColor(item.status)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )
    },
    {
      key: 'tasks',
      title: 'Zadania',
      value: `${completedTasks}/${totalTasks}`,
      icon: <AssignmentTurnedIn />,
      color: '#FF9800',
      expandContent: (
        <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
          <Table size="small" sx={{ '& tbody tr:hover': { bgcolor: '#2a2a2a' } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#2a2a2a' }}>
                <TableCell sx={{ color: '#e0e0e0' }}>Zadanie</TableCell>
                <TableCell align="right" sx={{ color: '#e0e0e0' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.slice(0, 5).map((task) => (
                <TableRow key={task.id}>
                  <TableCell sx={{ color: '#e0e0e0' }}>{task.title}</TableCell>
                  <TableCell align="right">
                    <Chip label={getStatusLabel(task.status)} size="small" color={getStatusColor(task.status)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )
    },
    {
      key: 'suppliers',
      title: 'Dostawcy',
      value: `${suppliers.length}`,
      icon: <TrendingUp />,
      color: '#9C27B0',
      expandContent: (
        <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
          <Table size="small" sx={{ '& tbody tr:hover': { bgcolor: '#2a2a2a' } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#2a2a2a' }}>
                <TableCell sx={{ color: '#e0e0e0' }}>Nazwa</TableCell>
                <TableCell align="right" sx={{ color: '#e0e0e0' }}>Kontakt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.slice(0, 5).map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell sx={{ color: '#e0e0e0' }}>{supplier.name}</TableCell>
                  <TableCell align="right" sx={{ color: '#e0e0e0' }}>{supplier.phone}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )
    },
    {
      key: 'financing',
      title: 'Finansowanie',
      value: `${approvedFinancing.toFixed(2)} zł`,
      icon: <AccountBalance />,
      color: '#00897B',
      expandContent: (
        <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
          <Table size="small" sx={{ '& tbody tr:hover': { bgcolor: '#2a2a2a' } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#2a2a2a' }}>
                <TableCell sx={{ color: '#e0e0e0' }}>Nazwa</TableCell>
                <TableCell align="right" sx={{ color: '#e0e0e0' }}>Kwota (zł)</TableCell>
                <TableCell align="right" sx={{ color: '#e0e0e0' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {financing.slice(0, 5).map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={{ color: '#e0e0e0' }}>{item.name}</TableCell>
                  <TableCell align="right" sx={{ color: '#e0e0e0' }}>{item.amount.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Chip label={getStatusLabel(item.status)} size="small" color={getStatusColor(item.status)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )
    },
    {
      key: 'calendar',
      title: 'Zdarzenia',
      value: `${upcomingEvents}`,
      icon: <EventIcon />,
      color: '#FF6B6B',
      expandContent: (
        <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
          <Table size="small" sx={{ '& tbody tr:hover': { bgcolor: '#2a2a2a' } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#2a2a2a' }}>
                <TableCell sx={{ color: '#e0e0e0' }}>Tytuł</TableCell>
                <TableCell align="right" sx={{ color: '#e0e0e0' }}>Data</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events
                .filter(e => new Date(e.startDate) > new Date())
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .slice(0, 5)
                .map((event) => (
                  <TableRow key={event.id}>
                    <TableCell sx={{ color: '#e0e0e0' }}>{event.title}</TableCell>
                    <TableCell align="right" sx={{ color: '#e0e0e0' }}>
                      {new Date(event.startDate).toLocaleDateString('pl-PL')}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )
    },
    {
      key: 'locations',
      title: 'Lokale',
      value: `${locations.length}`,
      icon: <LocationOn />,
      color: '#FF5722',
      expandContent: (
        <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
          <Table size="small" sx={{ '& tbody tr:hover': { bgcolor: '#2a2a2a' } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#2a2a2a' }}>
                <TableCell sx={{ color: '#e0e0e0' }}>Ulica</TableCell>
                <TableCell align="right" sx={{ color: '#e0e0e0' }}>Metraż (m²)</TableCell>
                <TableCell sx={{ color: '#e0e0e0' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {locations.slice(0, 5).map((location) => (
                <TableRow key={location.id}>
                  <TableCell sx={{ color: '#e0e0e0' }}>{location.street}</TableCell>
                  <TableCell align="right" sx={{ color: '#e0e0e0' }}>{location.squareMeters}</TableCell>
                  <TableCell sx={{ color: '#e0e0e0' }}>
                    <Chip label={location.status === 'interested' ? 'Zainteresowane' : location.status === 'negotiating' ? 'Negocjacje' : location.status === 'viewing' ? 'Oglądane' : 'Odrzucone'} size="small" color={location.status === 'interested' || location.status === 'negotiating' ? 'success' : 'default'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )
    },
    {
      key: 'menu',
      title: 'Menu',
      value: `${menuItems.length}`,
      icon: <RestaurantMenu />,
      color: '#E91E63',
      expandContent: (
        <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
          <Table size="small" sx={{ '& tbody tr:hover': { bgcolor: '#2a2a2a' } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#2a2a2a' }}>
                <TableCell sx={{ color: '#e0e0e0' }}>Nazwa</TableCell>
                <TableCell sx={{ color: '#e0e0e0' }}>Kategoria</TableCell>
                <TableCell sx={{ color: '#e0e0e0' }}>Typ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {menuItems.slice(0, 5).map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={{ color: '#e0e0e0' }}>{item.name}</TableCell>
                  <TableCell sx={{ color: '#e0e0e0' }}>
                    {item.category === 'beverage' ? 'Napoje' : 
                     item.category === 'dessert' ? 'Desery' : 
                     item.category === 'snack' ? 'Przekąski' : 
                     item.category === 'main' ? 'Dania główne' :
                     item.category === 'breakfast' ? 'Śniadania' : 'Inne'}
                  </TableCell>
                  <TableCell sx={{ color: '#e0e0e0' }}>
                    {item.dietary === 'vegan' ? '🌱 Vegan' : item.dietary === 'vegetarian' ? '🥗 Wegetariańskie' : 'Brak'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
