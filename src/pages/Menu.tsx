import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  IconButton,
  Box,
  MenuItem,
  Chip,
  FormControlLabel,
  RadioGroup,
  Radio
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useFirebase } from '../context/FirebaseContext';
import { MenuItem as MenuItemType } from '../types';

export const Menu: React.FC = () => {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useFirebase();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<MenuItemType, 'id'>>({
    name: '',
    description: '',
    category: 'beverage',
    dietary: 'none',
    price: 0,
    notes: ''
  });

  const handleOpenDialog = (item?: MenuItemType) => {
    if (item) {
      setFormData(item);
      setEditingId(item.id);
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'beverage',
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

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'beverage': 'Napoje',
      'dessert': 'Desery',
      'snack': 'Przekąski',
      'main': 'Dania główne',
      'breakfast': 'Śniadania',
      'other': 'Inne'
    };
    return labels[category] || category;
  };

  const getDietaryLabel = (dietary?: string) => {
    const labels: { [key: string]: string } = {
      'vegan': 'Vegan',
      'vegetarian': 'Wegetariańskie',
      'none': 'Brak'
    };
    return labels[dietary || 'none'] || 'Brak';
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
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <h2>Menu</h2>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          + Dodaj item
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
        <Table size="small" sx={{ '& tbody tr:hover': { bgcolor: '#2a2a2a' } }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#2a2a2a' }}>
              <TableCell sx={{ color: '#e0e0e0' }}>Nazwa</TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}>Opis</TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}>Kategoria</TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}>Typ</TableCell>
              <TableCell align="right" sx={{ color: '#e0e0e0' }}>Cena (zł)</TableCell>
              <TableCell sx={{ color: '#e0e0e0' }} align="center">Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {menuItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell sx={{ color: '#e0e0e0' }}>{item.name}</TableCell>
                <TableCell sx={{ color: '#e0e0e0' }}>{item.description}</TableCell>
                <TableCell sx={{ color: '#e0e0e0' }}>{getCategoryLabel(item.category)}</TableCell>
                <TableCell sx={{ color: '#e0e0e0' }}>
                  {item.dietary && (
                    <Chip
                      label={getDietaryLabel(item.dietary)}
                      size="small"
                      color={getDietaryColor(item.dietary)}
                    />
                  )}
                </TableCell>
                <TableCell align="right" sx={{ color: '#e0e0e0' }}>
                  {item.price ? item.price.toFixed(2) : '-'}
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                    <Edit sx={{ color: '#e0e0e0' }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(item.id)}>
                    <Delete sx={{ color: '#e0e0e0' }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edytuj item' : 'Dodaj nowy item'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Nazwa pozycji"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Opis"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
            fullWidth
          />
          <TextField
            select
            label="Kategoria"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as MenuItemType['category'] })}
            fullWidth
          >
            <MenuItem value="beverage">Napoje</MenuItem>
            <MenuItem value="dessert">Desery</MenuItem>
            <MenuItem value="snack">Przekąski</MenuItem>
            <MenuItem value="main">Dania główne</MenuItem>
            <MenuItem value="breakfast">Śniadania</MenuItem>
            <MenuItem value="other">Inne</MenuItem>
          </TextField>
          <Box>
            <label>Typ diety:</label>
            <RadioGroup
              value={formData.dietary || 'none'}
              onChange={(e) => setFormData({ ...formData, dietary: e.target.value as MenuItemType['dietary'] })}
            >
              <FormControlLabel value="none" control={<Radio />} label="Brak ograniczeń" />
              <FormControlLabel value="vegetarian" control={<Radio />} label="Wegetariańskie" />
              <FormControlLabel value="vegan" control={<Radio />} label="Vegan" />
            </RadioGroup>
          </Box>
          <TextField
            label="Cena (zł)"
            type="number"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            fullWidth
          />
          <TextField
            label="Notatki"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            multiline
            rows={3}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button onClick={handleSave} variant="contained">
            {editingId ? 'Aktualizuj' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Menu;
