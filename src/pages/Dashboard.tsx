import React, { useState } from 'react';
import { 
  Card, CardContent, CardHeader, Typography, Box, 
  Collapse, IconButton, Chip, Link as MuiLink
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { TrendingUp, AttachMoney, ShoppingCart, AssignmentTurnedIn, ExpandMore, AccountBalance, Event as EventIcon, LocationOn, RestaurantMenu, OpenInNew, Edit } from '@mui/icons-material';
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

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const ensureUrlProtocol = (url: string) => {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };

  const ModernListItem = ({ item, color, showQuantity, showStatus, showLink, linkType = 'link' }: any) => {
    const hasValidUrl = item.link && isValidUrl(ensureUrlProtocol(item.link));
    
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '11px 13px',
          backgroundColor: '#ffffff08',
          border: `1px solid ${color}20`,
          borderRadius: '7px',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: `${color}12`,
            border: `1px solid ${color}35`,
            transform: 'translateX(3px)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '11px', flex: 1 }}>
          <Box
            sx={{
              width: '3px',
              height: '30px',
              backgroundColor: color,
              borderRadius: '2px'
            }}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ 
              fontSize: '0.83rem', 
              fontWeight: 500, 
              color: '#e0e0e0',
              mb: '2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {item.name || item.title || item.street}
            </Typography>
            <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {showQuantity && (
                <Typography sx={{ fontSize: '0.7rem', color: '#b0b0b0' }}>
                  Ilość: {item.quantity}
                </Typography>
              )}
              {showStatus && (
                <Chip 
                  label={getStatusLabel(item.status)} 
                  size="small" 
                  color={getStatusColor(item.status)}
                  sx={{ height: '18px', fontSize: '0.6rem' }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {showLink && (
          hasValidUrl ? (
            <MuiLink 
              href={ensureUrlProtocol(item.link)}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: color,
                textDecoration: 'none',
                fontSize: '0.78rem',
                fontWeight: 500,
                padding: '5px 10px',
                borderRadius: '5px',
                backgroundColor: `${color}12`,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                '&:hover': {
                  backgroundColor: `${color}20`,
                  color: color,
                  gap: '7px'
                }
              }}
            >
              <OpenInNew sx={{ fontSize: '0.9rem' }} />
              Link
            </MuiLink>
          ) : (
            <MuiLink 
              href={`#${linkType}/${item.id}`}
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: color,
                textDecoration: 'none',
                fontSize: '0.78rem',
                fontWeight: 500,
                padding: '5px 10px',
                borderRadius: '5px',
                backgroundColor: `${color}12`,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                '&:hover': {
                  backgroundColor: `${color}20`,
                  color: color,
                  gap: '7px'
                }
              }}
            >
              <Edit sx={{ fontSize: '0.9rem' }} />
              {linkType === 'location' ? 'Szczegóły' : 'Edytuj'}
            </MuiLink>
          )
        )}
      </Box>
    );
  };

  const ModernListContainer = ({ children }: any) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
      {children}
    </Box>
  );

  const StatCard = ({ icon, title, value, color, expanded, onToggle, expandContent }: any) => (
    <Card
      sx={{
        height: '100%',
        width: '100%',
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
        avatar={<Box sx={{ color, fontSize: 40 }}>{icon}</Box>}
        title={<Typography sx={{ fontSize: '1.4rem', fontWeight: 500, color: '#e0e0e0', textAlign: 'center' }}>{title}</Typography>}
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
        sx={{ 
          pb: 2, 
          pt: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          '& .MuiCardHeader-action': {
            position: 'absolute',
            right: '8px',
            top: '8px'
          }
        }}
      />
      <CardContent sx={{ flex: 1 }} />
      <Collapse in={expanded} timeout="auto">
        <CardContent sx={{ 
          pt: 1, 
          pb: 1, 
          borderTop: `1px solid ${color}20`,
          maxHeight: '280px',
          overflow: 'auto'
        }}>
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
        <ModernListContainer>
          {costEstimates.slice(0, 6).map((item) => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: '#ffffff08',
                border: '1px solid #4CAF5020',
                borderRadius: '7px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#4CAF5012',
                  border: '1px solid #4CAF5035'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '11px', flex: 1 }}>
                <Box sx={{ width: '3px', height: '30px', backgroundColor: '#4CAF50', borderRadius: '2px' }} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontSize: '0.83rem', fontWeight: 500, color: '#e0e0e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#b0b0b0' }}>
                    {item.quantity}x {item.unitPrice.toFixed(2)} zł
                  </Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#4CAF50', whiteSpace: 'nowrap', ml: '12px' }}>
                {item.total.toFixed(2)} zł
              </Typography>
            </Box>
          ))}
        </ModernListContainer>
      )
    },
    {
      key: 'equipment',
      title: 'Wyposażenie',
      value: `${equipment.length}`,
      icon: <ShoppingCart />,
      color: '#2196F3',
      expandContent: (
        <ModernListContainer>
          {equipment.slice(0, 6).map((item) => (
            <ModernListItem 
              key={item.id}
              item={item}
              color="#2196F3"
              showQuantity={true}
              showLink={true}
            />
          ))}
        </ModernListContainer>
      )
    },
    {
      key: 'tasks',
      title: 'Zadania',
      value: `${completedTasks}/${totalTasks}`,
      icon: <AssignmentTurnedIn />,
      color: '#FF9800',
      expandContent: (
        <ModernListContainer>
          {tasks.slice(0, 6).map((item) => (
            <ModernListItem 
              key={item.id}
              item={item}
              color="#FF9800"
              showStatus={true}
            />
          ))}
        </ModernListContainer>
      )
    },
    {
      key: 'suppliers',
      title: 'Dostawcy',
      value: `${suppliers.length}`,
      icon: <TrendingUp />,
      color: '#9C27B0',
      expandContent: (
        <ModernListContainer>
          {suppliers.slice(0, 6).map((supplier) => (
            <Box
              key={supplier.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: '#ffffff08',
                border: '1px solid #9C27B020',
                borderRadius: '7px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#9C27B012',
                  border: '1px solid #9C27B035'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '11px', flex: 1 }}>
                <Box sx={{ width: '3px', height: '30px', backgroundColor: '#9C27B0', borderRadius: '2px' }} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontSize: '0.83rem', fontWeight: 500, color: '#e0e0e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {supplier.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#b0b0b0' }}>
                    {supplier.phone}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </ModernListContainer>
      )
    },
    {
      key: 'financing',
      title: 'Finansowanie',
      value: `${approvedFinancing.toFixed(2)} zł`,
      icon: <AccountBalance />,
      color: '#00897B',
      expandContent: (
        <ModernListContainer>
          {financing.slice(0, 6).map((item) => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: '#ffffff08',
                border: '1px solid #00897B20',
                borderRadius: '7px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#00897B12',
                  border: '1px solid #00897B35'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '11px', flex: 1 }}>
                <Box sx={{ width: '3px', height: '30px', backgroundColor: '#00897B', borderRadius: '2px' }} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontSize: '0.83rem', fontWeight: 500, color: '#e0e0e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#b0b0b0' }}>
                      {item.amount.toFixed(2)} zł
                    </Typography>
                    <Chip 
                      label={getStatusLabel(item.status)} 
                      size="small" 
                      color={getStatusColor(item.status)}
                      sx={{ height: '18px', fontSize: '0.6rem' }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </ModernListContainer>
      )
    },
    {
      key: 'calendar',
      title: 'Zdarzenia',
      value: `${upcomingEvents}`,
      icon: <EventIcon />,
      color: '#FF6B6B',
      expandContent: (
        <ModernListContainer>
          {events
            .filter(e => new Date(e.startDate) > new Date())
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .slice(0, 6)
            .map((item) => (
              <Box
                key={item.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  backgroundColor: '#ffffff08',
                  border: '1px solid #FF6B6B20',
                  borderRadius: '7px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#FF6B6B12',
                    border: '1px solid #FF6B6B35'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '11px', flex: 1 }}>
                  <Box sx={{ width: '3px', height: '30px', backgroundColor: '#FF6B6B', borderRadius: '2px' }} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontSize: '0.83rem', fontWeight: 500, color: '#e0e0e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#b0b0b0' }}>
                      {new Date(item.startDate).toLocaleDateString('pl-PL')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
        </ModernListContainer>
      )
    },
    {
      key: 'locations',
      title: 'Lokale',
      value: `${locations.length}`,
      icon: <LocationOn />,
      color: '#FF5722',
      expandContent: (
        <ModernListContainer>
          {locations.slice(0, 6).map((item) => (
            <ModernListItem 
              key={item.id}
              item={item}
              color="#FF5722"
              showLink={true}
              linkType="location"
            />
          ))}
        </ModernListContainer>
      )
    },
    {
      key: 'menu',
      title: 'Menu',
      value: `${menuItems.length}`,
      icon: <RestaurantMenu />,
      color: '#E91E63',
      expandContent: (
        <ModernListContainer>
          {menuItems.slice(0, 6).map((item) => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: '#ffffff08',
                border: '1px solid #E91E6320',
                borderRadius: '7px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#E91E6312',
                  border: '1px solid #E91E6335'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '11px', flex: 1 }}>
                <Box sx={{ width: '3px', height: '30px', backgroundColor: '#E91E63', borderRadius: '2px' }} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontSize: '0.83rem', fontWeight: 500, color: '#e0e0e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#b0b0b0' }}>
                    {item.category === 'beverage' ? 'Napój' : 
                     item.category === 'dessert' ? 'Deser' : 
                     item.category === 'snack' ? 'Przekąska' : 
                     item.category === 'main' ? 'Danie główne' :
                     item.category === 'breakfast' ? 'Śniadanie' : 'Inne'} • {item.dietary === 'vegan' ? '🌱 Vegan' : item.dietary === 'vegetarian' ? '🥗 Wegetariańskie' : 'Standardowe'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </ModernListContainer>
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

      <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
        {stats.map((stat) => (
          <Grid key={stat.key} size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex' }}>
            <Box sx={{ width: '100%' }}>
              <StatCard
                icon={stat.icon}
                title={stat.title}
                value={stat.value}
                color={stat.color}
                expanded={expandedCards[stat.key]}
                onToggle={() => toggleExpand(stat.key)}
                expandContent={stat.expandContent}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;