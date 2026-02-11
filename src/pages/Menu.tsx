import React, { useState, useMemo } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
  MenuItem,
  Chip,
  FormControlLabel,
  RadioGroup,
  Radio,
  Typography,
  Collapse
} from '@mui/material';
import { Edit, Delete, Add as AddIcon, ExpandMore } from '@mui/icons-material';
import { useFirebase } from '../context/FirebaseContext';
import { MenuItem as MenuItemType, MenuItemCategory } from '../types';

const CATEGORIES = [
  { value: 'coffee' as const, label: 'Kawy' },
  { value: 'tea' as const, label: 'Herbaty' },
  { value: 'beverage' as const, label: 'Napoje' },
  { value: 'breakfast_sweet' as const, label: 'Śniadania na słodko' },
  { value: 'breakfast_savory' as const, label: 'Śniadania na słono' },
  { value: 'dessert' as const, label: 'Desery' },
  { value: 'pastry_sweet' as const, label: 'Wypieki słodkie' },
  { value: 'pastry_savory' as const, label: 'Wypieki słone' }
];

const CATEGORY_COLORS: { [key: string]: string } = {
  'coffee': '#8B4513',
  'tea': '#6B8E23',
  'beverage': '#4169E1',
  'breakfast_sweet': '#FFD700',
  'breakfast_savory': '#FF8C00',
  'dessert': '#FF69B4',
  'pastry_sweet': '#F4A460',
  'pastry_savory': '#CD853F'
};

export const Menu: React.FC = () => {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useFirebase();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  
  const [formData, setFormData] = useState<Omit<MenuItemType, 'id'>>({
    name: '',
    description: '',
    category: 'coffee',
    dietary: 'none',
    price: 0,
    notes: ''
  });

  const sortedAndGroupedItems = useMemo(() => {
    const grouped = CATEGORIES.map(cat => ({
      category: cat,
      items: menuItems.filter(item => item.category === cat.value)
    })).filter(group => group.items.length > 0);
    
    return grouped;
  }, [menuItems]);

  const toggleCategory = (categoryValue: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryValue]: !prev[categoryValue]
    }));
  };

  const handleOpenDialog = (item?: MenuItemType) => {
    if (item) {
      setFormData(item);
      setEditingId(item.id);
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'coffee',
        dietary: 'none',
        price: 0,
        notes: ''
      });
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.description.trim()) return;

    if (editingId) {
      await updateMenuItem(editingId, formData);
    } else {
      await addMenuItem(formData);
    }
    handleCloseDialog();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten item z menu?')) {
      await deleteMenuItem(id);
    }
  };

  const getDietaryLabel = (dietary?: string) => {
    const labels: { [key: string]: string } = {
      'vegan': '🌱 Vegan',
      'vegetarian': '🥗 Wegetariańskie',
      'none': 'Standardowe'
    };
    return labels[dietary || 'none'] || 'Standardowe';
  };

  const getDietaryColor = (dietary?: string) => {
    switch (dietary) {
      case 'vegan':
        return 'success';
      case 'vegetarian':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#e0e0e0' }}>
          Menu
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => handleOpenDialog()}
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: '#E91E63',
            '&:hover': {
              backgroundColor: '#C2185B'
            }
          }}
        >
          Dodaj
        </Button>
      </Box>

      {sortedAndGroupedItems.map((group) => (
        <Box key={group.category.value} sx={{ mb: 1 }}>
          <Box
            onClick={() => toggleCategory(group.category.value)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              padding: '10px 12px',
              backgroundColor: '#ffffff08',
              border: `1px solid ${CATEGORY_COLORS[group.category.value]}30`,
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: `${CATEGORY_COLORS[group.category.value]}12`,
                border: `1px solid ${CATEGORY_COLORS[group.category.value]}50`
              }
            }}
          >
            <ExpandMore 
              sx={{
                color: CATEGORY_COLORS[group.category.value],
                transform: expandedCategories[group.category.value] ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.2s ease',
                fontSize: '1.2rem'
              }}
            />
            <Box sx={{ width: '3px', height: '20px', backgroundColor: CATEGORY_COLORS[group.category.value] }} />
            <Typography 
              sx={{ 
                fontWeight: 600, 
                color: CATEGORY_COLORS[group.category.value],
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.85rem',
                flex: 1
              }}
            >
              {group.category.label} ({group.items.length})
            </Typography>
          </Box>

          <Collapse in={expandedCategories[group.category.value]} timeout="auto">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mt: 0.8, ml: 1.5, pl: 2, borderLeft: `2px solid ${CATEGORY_COLORS[group.category.value]}30` }}>
              {group.items.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    padding: '8px 10px',
                    backgroundColor: '#ffffff08',
                    border: `1px solid ${CATEGORY_COLORS[item.category]}20`,
                    borderRadius: '5px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: `${CATEGORY_COLORS[item.category]}12`,
                      border: `1px solid ${CATEGORY_COLORS[item.category]}40`,
                      transform: 'translateX(2px)'
                    }
                  }}
                >
                  <Box sx={{ width: '2px', height: '20px', backgroundColor: CATEGORY_COLORS[item.category] }} />
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      sx={{ 
                        fontSize: '0.8rem', 
                        fontWeight: 500, 
                        color: '#e0e0e0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography 
                      sx={{ 
                        fontSize: '0.7rem', 
                        color: '#b0b0b0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {item.dietary && item.dietary !== 'none' && (
                      <Chip
                        label={getDietaryLabel(item.dietary)}
                        size="small"
                        color={getDietaryColor(item.dietary)}
                        sx={{ height: '18px', fontSize: '0.65rem' }}
                      />
                    )}
                    
                    <Typography 
                      sx={{ 
                        fontSize: '0.8rem', 
                        fontWeight: 600, 
                        color: CATEGORY_COLORS[item.category],
                        minWidth: '35px',
                        textAlign: 'right'
                      }}
                    >
                      {item.price ? `${item.price.toFixed(0)}zł` : '-'}
                    </Typography>

                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog(item)}
                      sx={{ color: CATEGORY_COLORS[item.category], p: '4px' }}
                    >
                      <Edit fontSize="small" sx={{ fontSize: '0.95rem' }} />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(item.id)}
                      sx={{ color: '#FF6B6B', p: '4px' }}
                    >
                      <Delete fontSize="small" sx={{ fontSize: '0.95rem' }} />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Box>
      ))}

      {menuItems.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography sx={{ color: '#b0b0b0', mb: 2 }}>
            Nie ma jeszcze żadnych itemów w menu
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => handleOpenDialog()}
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: '#E91E63',
              '&:hover': {
                backgroundColor: '#C2185B'
              }
            }}
          >
            Dodaj pierwszy item
          </Button>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#1e1e1e', color: '#e0e0e0' }}>
          {editingId ? 'Edytuj item' : 'Dodaj nowy item'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2, backgroundColor: '#1e1e1e' }}>
          <TextField
            label="Nazwa pozycji"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#e0e0e0',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#444'
              }
            }}
          />
          <TextField
            label="Opis"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#e0e0e0',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#444'
              }
            }}
          />
          <TextField
            select
            label="Kategoria"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as MenuItemCategory })}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#e0e0e0',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#444'
              }
            }}
          >
            {CATEGORIES.map(cat => (
              <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
            ))}
          </TextField>
          <Box>
            <Typography sx={{ color: '#e0e0e0', mb: 1, fontWeight: 500 }}>Typ diety:</Typography>
            <RadioGroup
              value={formData.dietary || 'none'}
              onChange={(e) => setFormData({ ...formData, dietary: e.target.value as MenuItemType['dietary'] })}
            >
              <FormControlLabel value="none" control={<Radio />} label="Standardowe" sx={{ color: '#e0e0e0' }} />
              <FormControlLabel value="vegetarian" control={<Radio />} label="🥗 Wegetariańskie" sx={{ color: '#e0e0e0' }} />
              <FormControlLabel value="vegan" control={<Radio />} label="🌱 Vegan" sx={{ color: '#e0e0e0' }} />
            </RadioGroup>
          </Box>
          <TextField
            label="Cena (zł)"
            type="number"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#e0e0e0',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#444'
              }
            }}
          />
          <TextField
            label="Notatki"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            multiline
            rows={3}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#e0e0e0',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#444'
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#1e1e1e', p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ color: '#e0e0e0' }}>Anuluj</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            sx={{
              backgroundColor: '#E91E63',
              '&:hover': {
                backgroundColor: '#C2185B'
              }
            }}
          >
            {editingId ? 'Aktualizuj' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Menu;