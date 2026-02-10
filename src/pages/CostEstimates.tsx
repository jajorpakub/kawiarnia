import React, { useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useFirebase } from '../context/FirebaseContext';
import { CostEstimateItem } from '../types';

const CostEstimates: React.FC = () => {
  const { costEstimates, addCostEstimate, updateCostEstimate, deleteCostEstimate, loading } = useFirebase();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CostEstimateItem>>({
    name: '',
    quantity: 1,
    unitPrice: 0,
    notes: ''
  });

  const handleOpen = (item?: CostEstimateItem) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({ name: '', quantity: 1, unitPrice: 0, notes: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.name || formData.quantity! <= 0 || formData.unitPrice! < 0) {
      alert('Proszę wypełnić wszystkie pola poprawnie');
      return;
    }

    const total = (formData.quantity || 1) * (formData.unitPrice || 0);

    try {
      if (editingId) {
        await updateCostEstimate(editingId, { ...formData, total });
      } else {
        await addCostEstimate({
          name: formData.name!,
          quantity: formData.quantity || 1,
          unitPrice: formData.unitPrice || 0,
          total,
          notes: formData.notes
        });
      }
      handleClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Błąd podczas zapisywania');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę pozycję?')) {
      try {
        await deleteCostEstimate(id);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const totalSum = costEstimates.reduce((sum, item) => sum + item.total, 0);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Kosztorysy</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Dodaj pozycję
        </Button>
      </Box>

      {costEstimates.length > 0 && (
        <Card sx={{ mb: 3, bgcolor: '#2a2a2a' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Podsumowanie</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography><strong>Liczba pozycji:</strong> {costEstimates.length}</Typography>
              <Typography><strong>Razem:</strong> {totalSum.toFixed(2)} zł</Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#2a2a2a' }}>
            <TableRow>
              <TableCell sx={{ color: '#e0e0e0' }}><strong>Nazwa</strong></TableCell>
              <TableCell align="right" sx={{ color: '#e0e0e0' }}><strong>Ilość</strong></TableCell>
              <TableCell align="right" sx={{ color: '#e0e0e0' }}><strong>Cena jednostkowa</strong></TableCell>
              <TableCell align="right" sx={{ color: '#e0e0e0' }}><strong>Razem</strong></TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}><strong>Notatki</strong></TableCell>
              <TableCell align="center" sx={{ color: '#e0e0e0' }}><strong>Akcje</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {costEstimates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">Brak pozycji. Dodaj pierwszą pozycję!</Typography>
                </TableCell>
              </TableRow>
            ) : (
              costEstimates.map((item) => (
                <TableRow key={item.id} hover sx={{ '&:hover': { bgcolor: '#2a2a2a' } }}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{item.unitPrice.toFixed(2)} zł</TableCell>
                  <TableCell align="right"><strong>{item.total.toFixed(2)} zł</strong></TableCell>
                  <TableCell>{item.notes || '-'}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="primary" onClick={() => handleOpen(item)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edytuj pozycję' : 'Dodaj nową pozycję'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField fullWidth label="Nazwa" value={formData.name || ''} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} margin="normal" />
          <TextField fullWidth label="Ilość" type="number" inputProps={{ min: 1, step: 1 }}
            value={formData.quantity || 1} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} margin="normal" />
          <TextField fullWidth label="Cena jednostkowa (zł)" type="number" inputProps={{ min: 0, step: 0.01 }}
            value={formData.unitPrice || 0} onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })} margin="normal" />
          <TextField fullWidth label="Notatki" multiline rows={2} value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })} margin="normal" />
          {formData.quantity && formData.unitPrice && (
            <Typography sx={{ mt: 2, p: 1, bgcolor: '#f0f0f0', borderRadius: 1 }}>
              <strong>Razem: {((formData.quantity || 0) * (formData.unitPrice || 0)).toFixed(2)} zł</strong>
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Anuluj</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Zapisz</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CostEstimates;
