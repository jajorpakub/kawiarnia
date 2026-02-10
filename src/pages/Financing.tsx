import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useFirebase } from '../context/FirebaseContext';
import { Financing } from '../types';

const FinancingPage: React.FC = () => {
  const { financing, addFinancing, updateFinancing, deleteFinancing } = useFirebase();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Financing, 'id'>>({
    name: '',
    type: 'credit',
    amount: 0,
    approvedAmount: 0,
    interestRate: 0,
    repaymentPeriod: 0,
    status: 'applied',
    lender: '',
    notes: '',
  });

  const handleOpenDialog = (item?: Financing) => {
    if (item) {
      setFormData(item);
      setEditingId(item.id);
    } else {
      setFormData({
        name: '',
        type: 'credit',
        amount: 0,
        approvedAmount: 0,
        interestRate: 0,
        repaymentPeriod: 0,
        status: 'applied',
        lender: '',
        notes: '',
      });
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateFinancing(editingId, formData);
      } else {
        await addFinancing(formData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving financing:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten element?')) {
      try {
        await deleteFinancing(id);
      } catch (error) {
        console.error('Error deleting financing:', error);
      }
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      credit: 'Kredyt',
      grant: 'Dotacja',
      loan: 'Pożyczka',
      investment: 'Inwestycja',
      other: 'Inne',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
      credit: 'info',
      grant: 'success',
      loan: 'warning',
      investment: 'primary',
      other: 'default',
    };
    return colors[type] || 'default';
  };

  const getStatusLabel = (status?: string) => {
    const labels: { [key: string]: string } = {
      applied: 'Złożone',
      approved: 'Zatwierdzono',
      rejected: 'Odrzucono',
      active: 'Aktywne',
      completed: 'Ukończone',
    };
    return labels[status || ''] || status || 'Brak statusu';
  };

  const getStatusColor = (status?: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
      applied: 'info',
      approved: 'success',
      rejected: 'error',
      active: 'warning',
      completed: 'success',
    };
    return colors[status || ''] || 'default';
  };

  const totalAmount = financing.reduce((sum, item) => sum + item.amount, 0);
  const totalApproved = financing.reduce((sum, item) => sum + (item.approvedAmount || 0), 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Kredyty/Dofinansowanie</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Dodaj finansowanie
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Łączna kwota
            </Typography>
            <Typography variant="h5">
              {totalAmount.toFixed(2)} zł
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Zatwierdzona kwota
            </Typography>
            <Typography variant="h5">
              {totalApproved.toFixed(2)} zł
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#2a2a2a' }}>
            <TableRow>
              <TableCell sx={{ color: '#e0e0e0' }}>Nazwa</TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}>Typ</TableCell>
              <TableCell align="right" sx={{ color: '#e0e0e0' }}>Kwota (zł)</TableCell>
              <TableCell align="right" sx={{ color: '#e0e0e0' }}>Zatwierdzona (zł)</TableCell>
              <TableCell align="right" sx={{ color: '#e0e0e0' }}>Oprocentowanie (%)</TableCell>
              <TableCell align="right" sx={{ color: '#e0e0e0' }}>Okres spłaty (m-ce)</TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}>Pożyczkodawca</TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}>Status</TableCell>
              <TableCell align="center" sx={{ color: '#e0e0e0' }}>Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {financing.map((item) => (
              <TableRow key={item.id} sx={{ '&:hover': { bgcolor: '#2a2a2a' } }}>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <Chip
                    label={getTypeLabel(item.type)}
                    color={getTypeColor(item.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">{item.amount.toFixed(2)}</TableCell>
                <TableCell align="right">{(item.approvedAmount || 0).toFixed(2)}</TableCell>
                <TableCell align="right">{item.interestRate || '-'}</TableCell>
                <TableCell align="right">{item.repaymentPeriod || '-'}</TableCell>
                <TableCell>{item.lender || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(item.status)}
                    color={getStatusColor(item.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(item)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(item.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edytuj finansowanie' : 'Dodaj finansowanie'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Nazwa"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Typ</InputLabel>
            <Select
              value={formData.type}
              label="Typ"
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              <MenuItem value="credit">Kredyt</MenuItem>
              <MenuItem value="grant">Dotacja</MenuItem>
              <MenuItem value="loan">Pożyczka</MenuItem>
              <MenuItem value="investment">Inwestycja</MenuItem>
              <MenuItem value="other">Inne</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Kwota (zł)"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Zatwierdzona kwota (zł)"
            type="number"
            value={formData.approvedAmount}
            onChange={(e) => setFormData({ ...formData, approvedAmount: parseFloat(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Oprocentowanie (%)"
            type="number"
            value={formData.interestRate}
            onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Okres spłaty (miesiące)"
            type="number"
            value={formData.repaymentPeriod}
            onChange={(e) => setFormData({ ...formData, repaymentPeriod: parseInt(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Pożyczkodawca"
            value={formData.lender}
            onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status || 'applied'}
              label="Status"
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <MenuItem value="applied">Złożone</MenuItem>
              <MenuItem value="approved">Zatwierdzono</MenuItem>
              <MenuItem value="rejected">Odrzucono</MenuItem>
              <MenuItem value="active">Aktywne</MenuItem>
              <MenuItem value="completed">Ukończone</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Notatki"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button onClick={handleSave} variant="contained">
            Zapisz
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinancingPage;
