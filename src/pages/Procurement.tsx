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
  Tabs,
  Tab,
  Typography
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useFirebase } from '../context/FirebaseContext';
import { CostEstimateItem, Supplier, Equipment } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

export const Procurement: React.FC = () => {
  const { costEstimates, addCostEstimate, updateCostEstimate, deleteCostEstimate,
          suppliers, addSupplier, updateSupplier, deleteSupplier,
          equipment, addEquipment, updateEquipment, deleteEquipment } = useFirebase();
  
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'costEstimate' | 'supplier' | 'equipment'>('costEstimate');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Cost Estimate Form
  const [costFormData, setCostFormData] = useState<Omit<CostEstimateItem, 'id'>>({
    name: '',
    quantity: 1,
    unitPrice: 0,
    total: 0,
    notes: ''
  });

  // Supplier Form
  const [supplierFormData, setSupplierFormData] = useState<Omit<Supplier, 'id'>>({
    name: '',
    contact: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Equipment Form
  const [equipmentFormData, setEquipmentFormData] = useState<Omit<Equipment, 'id'>>({
    name: '',
    quantity: 1,
    unitPrice: 0,
    supplier: '',
    status: 'pending',
    notes: ''
  });

  const handleOpenDialog = (type: 'costEstimate' | 'supplier' | 'equipment', item?: any) => {
    setDialogType(type);
    
    if (type === 'costEstimate' && item) {
      setCostFormData(item);
      setEditingId(item.id);
    } else if (type === 'costEstimate') {
      setCostFormData({ name: '', quantity: 1, unitPrice: 0, total: 0, notes: '' });
      setEditingId(null);
    } else if (type === 'supplier' && item) {
      setSupplierFormData(item);
      setEditingId(item.id);
    } else if (type === 'supplier') {
      setSupplierFormData({ name: '', contact: '', email: '', phone: '', notes: '' });
      setEditingId(null);
    } else if (type === 'equipment' && item) {
      setEquipmentFormData(item);
      setEditingId(item.id);
    } else {
      setEquipmentFormData({ name: '', quantity: 1, unitPrice: 0, supplier: '', status: 'pending', notes: '' });
      setEditingId(null);
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    try {
      if (dialogType === 'costEstimate') {
        if (!costFormData.name.trim()) return;
        const total = costFormData.quantity * costFormData.unitPrice;
        if (editingId) {
          await updateCostEstimate(editingId, { ...costFormData, total });
        } else {
          await addCostEstimate({ ...costFormData, total });
        }
      } else if (dialogType === 'supplier') {
        if (!supplierFormData.name.trim()) return;
        if (editingId) {
          await updateSupplier(editingId, supplierFormData);
        } else {
          await addSupplier(supplierFormData);
        }
      } else if (dialogType === 'equipment') {
        if (!equipmentFormData.name.trim()) return;
        if (editingId) {
          await updateEquipment(editingId, equipmentFormData);
        } else {
          await addEquipment(equipmentFormData);
        }
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleDelete = async (type: 'costEstimate' | 'supplier' | 'equipment', id: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć?')) {
      if (type === 'costEstimate') await deleteCostEstimate(id);
      else if (type === 'supplier') await deleteSupplier(id);
      else if (type === 'equipment') await deleteEquipment(id);
    }
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

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>Procurement & Zaopatrzenie</Typography>
      
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
        <Tab label={`Kosztorysy (${costEstimates.length})`} />
        <Tab label={`Dostawcy (${suppliers.length})`} />
        <Tab label={`Wyposażenie (${equipment.length})`} />
      </Tabs>

      {/* Cost Estimates Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" onClick={() => handleOpenDialog('costEstimate')}>
            + Dodaj kosztorys
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
          <Table size="small" sx={{ '& tbody tr:hover': { bgcolor: '#2a2a2a' } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#2a2a2a' }}>
                <TableCell sx={{ color: '#e0e0e0' }}>Nazwa</TableCell>
                <TableCell align="right" sx={{ color: '#e0e0e0' }}>Ilość</TableCell>
                <TableCell align="right" sx={{ color: '#e0e0e0' }}>Cena jedn.</TableCell>
                <TableCell align="right" sx={{ color: '#e0e0e0' }}>Razem</TableCell>
                <TableCell sx={{ color: '#e0e0e0' }}>Notatki</TableCell>
                <TableCell sx={{ color: '#e0e0e0' }} align="center">Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {costEstimates.map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={{ color: '#e0e0e0' }}>{item.name}</TableCell>
                  <TableCell align="right" sx={{ color: '#e0e0e0' }}>{item.quantity}</TableCell>
                  <TableCell align="right" sx={{ color: '#e0e0e0' }}>{item.unitPrice.toFixed(2)} zł</TableCell>
                  <TableCell align="right" sx={{ color: '#e0e0e0' }}>{item.total.toFixed(2)} zł</TableCell>
                  <TableCell sx={{ color: '#e0e0e0' }}>{item.notes || '-'}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleOpenDialog('costEstimate', item)}>
                      <Edit sx={{ color: '#e0e0e0' }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete('costEstimate', item.id)}>
                      <Delete sx={{ color: '#e0e0e0' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Suppliers Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" onClick={() => handleOpenDialog('supplier')}>
            + Dodaj dostawcę
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
          <Table size="small" sx={{ '& tbody tr:hover': { bgcolor: '#2a2a2a' } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#2a2a2a' }}>
                <TableCell sx={{ color: '#e0e0e0' }}>Nazwa</TableCell>
                <TableCell sx={{ color: '#e0e0e0' }}>Osoba kontaktowa</TableCell>
                <TableCell sx={{ color: '#e0e0e0' }}>Email</TableCell>
                <TableCell sx={{ color: '#e0e0e0' }}>Telefon</TableCell>
                <TableCell sx={{ color: '#e0e0e0' }}>Notatki</TableCell>
                <TableCell sx={{ color: '#e0e0e0' }} align="center">Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell sx={{ color: '#e0e0e0' }}>{supplier.name}</TableCell>
                  <TableCell sx={{ color: '#e0e0e0' }}>{supplier.contact}</TableCell>
                  <TableCell sx={{ color: '#e0e0e0' }}>{supplier.email}</TableCell>
                  <TableCell sx={{ color: '#e0e0e0' }}>{supplier.phone}</TableCell>
                  <TableCell sx={{ color: '#e0e0e0' }}>{supplier.notes || '-'}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleOpenDialog('supplier', supplier)}>
                      <Edit sx={{ color: '#e0e0e0' }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete('supplier', supplier.id)}>
                      <Delete sx={{ color: '#e0e0e0' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Equipment Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" onClick={() => handleOpenDialog('equipment')}>
            + Dodaj wyposażenie
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
          <Table size="small" sx={{ '& tbody tr:hover': { bgcolor: '#2a2a2a' } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#2a2a2a' }}>
                <TableCell sx={{ color: '#e0e0e0' }}>Nazwa</TableCell>
                <TableCell align="right" sx={{ color: '#e0e0e0' }}>Ilość</TableCell>
                <TableCell sx={{ color: '#e0e0e0' }}>Dostawca</TableCell>
                <TableCell sx={{ color: '#e0e0e0' }}>Status</TableCell>
                <TableCell sx={{ color: '#e0e0e0' }}>Notatki</TableCell>
                <TableCell sx={{ color: '#e0e0e0' }} align="center">Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {equipment.map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={{ color: '#e0e0e0' }}>{item.name}</TableCell>
                  <TableCell align="right" sx={{ color: '#e0e0e0' }}>{item.quantity}</TableCell>
                  <TableCell sx={{ color: '#e0e0e0' }}>{item.supplier || '-'}</TableCell>
                  <TableCell sx={{ color: '#e0e0e0' }}>
                    <Chip label={getStatusLabel(item.status)} size="small" color={getStatusColor(item.status)} />
                  </TableCell>
                  <TableCell sx={{ color: '#e0e0e0' }}>{item.notes || '-'}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleOpenDialog('equipment', item)}>
                      <Edit sx={{ color: '#e0e0e0' }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete('equipment', item.id)}>
                      <Delete sx={{ color: '#e0e0e0' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'costEstimate' && (editingId ? 'Edytuj kosztorys' : 'Dodaj kosztorys')}
          {dialogType === 'supplier' && (editingId ? 'Edytuj dostawcę' : 'Dodaj dostawcę')}
          {dialogType === 'equipment' && (editingId ? 'Edytuj wyposażenie' : 'Dodaj wyposażenie')}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {dialogType === 'costEstimate' && (
            <>
              <TextField
                label="Nazwa"
                value={costFormData.name}
                onChange={(e) => setCostFormData({ ...costFormData, name: e.target.value })}
                fullWidth
              />
              <TextField
                label="Ilość"
                type="number"
                value={costFormData.quantity}
                onChange={(e) => setCostFormData({ ...costFormData, quantity: parseFloat(e.target.value) })}
                fullWidth
              />
              <TextField
                label="Cena jednostkowa (zł)"
                type="number"
                value={costFormData.unitPrice}
                onChange={(e) => setCostFormData({ ...costFormData, unitPrice: parseFloat(e.target.value) })}
                fullWidth
              />
              <TextField
                label="Notatki"
                value={costFormData.notes || ''}
                onChange={(e) => setCostFormData({ ...costFormData, notes: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
            </>
          )}
          {dialogType === 'supplier' && (
            <>
              <TextField
                label="Nazwa"
                value={supplierFormData.name}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, name: e.target.value })}
                fullWidth
              />
              <TextField
                label="Osoba kontaktowa"
                value={supplierFormData.contact}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, contact: e.target.value })}
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={supplierFormData.email}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, email: e.target.value })}
                fullWidth
              />
              <TextField
                label="Telefon"
                value={supplierFormData.phone}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, phone: e.target.value })}
                fullWidth
              />
              <TextField
                label="Notatki"
                value={supplierFormData.notes || ''}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, notes: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
            </>
          )}
          {dialogType === 'equipment' && (
            <>
              <TextField
                label="Nazwa"
                value={equipmentFormData.name}
                onChange={(e) => setEquipmentFormData({ ...equipmentFormData, name: e.target.value })}
                fullWidth
              />
              <TextField
                label="Ilość"
                type="number"
                value={equipmentFormData.quantity}
                onChange={(e) => setEquipmentFormData({ ...equipmentFormData, quantity: parseFloat(e.target.value) })}
                fullWidth
              />
              <TextField
                label="Cena jednostkowa (zł)"
                type="number"
                value={equipmentFormData.unitPrice}
                onChange={(e) => setEquipmentFormData({ ...equipmentFormData, unitPrice: parseFloat(e.target.value) })}
                fullWidth
              />
              <TextField
                label="Dostawca"
                value={equipmentFormData.supplier || ''}
                onChange={(e) => setEquipmentFormData({ ...equipmentFormData, supplier: e.target.value })}
                fullWidth
              />
              <TextField
                select
                label="Status"
                value={equipmentFormData.status || 'pending'}
                onChange={(e) => setEquipmentFormData({ ...equipmentFormData, status: e.target.value as any })}
                fullWidth
              >
                <MenuItem value="pending">Oczekujące</MenuItem>
                <MenuItem value="ordered">Zamówione</MenuItem>
                <MenuItem value="received">Otrzymane</MenuItem>
              </TextField>
              <TextField
                label="Notatki"
                value={equipmentFormData.notes || ''}
                onChange={(e) => setEquipmentFormData({ ...equipmentFormData, notes: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
            </>
          )}
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

export default Procurement;
