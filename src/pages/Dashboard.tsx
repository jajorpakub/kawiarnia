import React, { useState } from 'react';
import { 
  Card, CardContent, CardHeader, Typography, Box, LinearProgress, 
  Collapse, IconButton, Table, TableBody, TableCell, TableHead, TableRow,
  Chip, TableContainer, Paper
} from '@mui/material';
import { TrendingUp, AttachMoney, ShoppingCart, AssignmentTurnedIn, ExpandMore, AccountBalance, Event as EventIcon } from '@mui/icons-material';
import { useFirebase } from '../context/FirebaseContext';

const Dashboard: React.FC = () => {
  const { costEstimates, equipment, tasks, suppliers, financing, events } = useFirebase();
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});

  const totalBudget = costEstimates.reduce((sum, item) => sum + item.total, 0);
  const equipmentValue = equipment.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const totalFinancing = financing.reduce((sum, item) => sum + item.amount, 0);
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

  const stats = [
    {
      key: 'budget',
      title: 'Szacowany budżet',
      value: `${totalBudget.toFixed(2)} zł`,
      icon: <AttachMoney />,
      color: '#4CAF50',
      progress: 65,
      expandContent: (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Nazwa</TableCell>
                <TableCell align="right">Ilość</TableCell>
                <TableCell align="right">Cena</TableCell>
                <TableCell align="right">Razem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {costEstimates.slice(0, 5).map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{item.unitPrice.toFixed(2)} zł</TableCell>
                  <TableCell align="right">{item.total.toFixed(2)} zł</TableCell>
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
      value: `${equipmentValue.toFixed(2)} zł`,
      icon: <ShoppingCart />,
      color: '#2196F3',
      progress: Math.min((equipmentValue / totalBudget * 100) || 0, 100),
      expandContent: (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Nazwa</TableCell>
                <TableCell align="right">Ilość</TableCell>
                <TableCell align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {equipment.slice(0, 5).map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
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
      title: 'Wykonane zadania',
      value: `${completedTasks}/${totalTasks}`,
      icon: <AssignmentTurnedIn />,
      color: '#FF9800',
      progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      expandContent: (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Zadanie</TableCell>
                <TableCell align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.slice(0, 5).map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
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
      title: 'Liczba dostawców',
      value: `${suppliers.length}`,
      icon: <TrendingUp />,
      color: '#9C27B0',
      progress: Math.min(suppliers.length * 10, 100),
      expandContent: (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Nazwa</TableCell>
                <TableCell align="right">Kontakt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.slice(0, 5).map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell align="right">{supplier.phone}</TableCell>
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
      progress: totalFinancing > 0 ? (approvedFinancing / totalFinancing * 100) : 0,
      expandContent: (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Nazwa</TableCell>
                <TableCell align="right">Kwota (zł)</TableCell>
                <TableCell align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {financing.slice(0, 5).map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{item.amount.toFixed(2)}</TableCell>
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
      title: 'Nadchodzące zdarzenia',
      value: `${upcomingEvents}`,
      icon: <EventIcon />,
      color: '#FF6B6B',
      progress: Math.min(upcomingEvents * 10, 100),
      expandContent: (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Tytuł</TableCell>
                <TableCell align="right">Data</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events
                .filter(e => new Date(e.startDate) > new Date())
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .slice(0, 5)
                .map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{event.title}</TableCell>
                    <TableCell align="right">
                      {new Date(event.startDate).toLocaleDateString('pl-PL')}
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
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Panel główny - Przygotowania do otwarcia kawiarni
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr' }, gap: 3 }}>
        {stats.map((stat) => (
          <Box key={stat.key}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                avatar={<Box sx={{ color: stat.color }}>{stat.icon}</Box>}
                title={stat.title}
                action={
                  <IconButton 
                    onClick={() => toggleExpand(stat.key)}
                    sx={{ transform: expandedCards[stat.key] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                  >
                    <ExpandMore />
                  </IconButton>
                }
                sx={{ pb: 1 }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h4" gutterBottom>
                  {stat.value}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={stat.progress}
                      sx={{
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: stat.color,
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">
                      {`${Math.round(stat.progress)}%`}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <Collapse in={expandedCards[stat.key]} timeout="auto" unmountOnExit>
                <CardContent sx={{ pt: 0, borderTop: '1px solid #eee' }}>
                  {stat.expandContent}
                </CardContent>
              </Collapse>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Dashboard;
