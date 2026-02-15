import React, { useState } from 'react';
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
  Typography,
  Link as MuiLink,
  Tabs,
  Tab
} from '@mui/material';
import { Edit, Delete, Add as AddIcon, OpenInNew } from '@mui/icons-material';
import { useFirebase } from '../context/FirebaseContext';
import { CostEstimateItem, Supplier, Equipment } from '../types';

const COLORS = {
  costEstimate: '#4CAF50',
  supplier: '#9C27B0',
  equipment: '#2196F3'
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
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

  const [costFormData, setCostFormData] = useState<Omit<CostEstimateItem, 'id'>>({
    name: '',
    quantity: 1,
    unitPrice: 0,
    total: 0,
    link: '',
    notes: ''
  });

  const [supplierFormData, setSupplierFormData] = useState<Omit<Supplier, 'id'>>({
    name: '',
    contact: '',
    email: '',
    phone: '',
    notes: ''
  });

  const [equipmentFormData, setEquipmentFormData] = useState<Omit<Equipment, 'id'>>({
    name: '',
    quantity: 1,
    unitPrice: 0,
    supplier: '',
    link: '',
    status: 'pending',
    notes: ''
  });

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

  const handleOpenDialog = (type: 'costEstimate' | 'supplier' | 'equipment', item?: any) => {
    setDialogType(type);
    
    if (type === 'costEstimate' && item) {
      setCostFormData(item);
      setEditingId(item.id);
    } else if (type === 'costEstimate') {
      setCostFormData({ name: '', quantity: 1, unitPrice: 0, total: 0, link: '', notes: '' });
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
      setEquipmentFormData({ name: '', quantity: 1, unitPrice: 0, supplier: '', status: 'pending', link: '', notes: '' });
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
      case 'received':
        return 'success';
      case 'ordered':
        return 'warning';
      case 'pending':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status?: string) => {
    const labels: { [key: string]: string } = {
      'received': 'Otrzymane',
      'ordered': 'Zamówione',
      'pending': 'Oczekujące'
    };
    return labels[status || 'default'] || status || 'Brak statusu';
  };

  const CostEstimateCard = ({ item }: { item: CostEstimateItem }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '14px 16px',
        background: `linear-gradient(135deg, ${COLORS.costEstimate}15 0%, ${COLORS.costEstimate}08 100%)`,
        border: `1px solid ${COLORS.costEstimate}30`,
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0 8px 24px ${COLORS.costEstimate}20`,
          border: `1px solid ${COLORS.costEstimate}50`,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Box sx={{ width: '4px', height: '60px', backgroundColor: COLORS.costEstimate, borderRadius: '2px', flexShrink: 0 }} />
      
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#e0e0e0', mb: 0.5 }}>
          {item.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: '0.8rem', color: '#b0b0b0' }}>
            {item.quantity}x {item.unitPrice.toFixed(2)} zł
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.costEstimate }}>
            = {item.total.toFixed(2)} zł
          </Typography>
        </Box>
        {item.notes && <Typography sx={{ fontSize: '0.75rem', color: '#909090', mt: 0.5, fontStyle: 'italic' }}>{item.notes}</Typography>}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
        {item.link && isValidUrl(ensureUrlProtocol(item.link)) && (
          <MuiLink 
            href={ensureUrlProtocol(item.link)}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: COLORS.costEstimate,
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: 500,
              padding: '6px 10px',
              borderRadius: '5px',
              backgroundColor: `${COLORS.costEstimate}12`,
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              '&:hover': {
                backgroundColor: `${COLORS.costEstimate}20`,
                gap: '6px'
              }
            }}
          >
            <OpenInNew sx={{ fontSize: '0.95rem' }} />
            Link
          </MuiLink>
        )}
        <IconButton size="small" onClick={() => handleOpenDialog('costEstimate', item)} sx={{ color: COLORS.costEstimate, p: '6px' }}>
          <Edit fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => handleDelete('costEstimate', item.id)} sx={{ color: '#FF6B6B', p: '6px' }}>
          <Delete fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );

  const SupplierCard = ({ supplier }: { supplier: Supplier }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '14px 16px',
        background: `linear-gradient(135deg, ${COLORS.supplier}15 0%, ${COLORS.supplier}08 100%)`,
        border: `1px solid ${COLORS.supplier}30`,
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0 8px 24px ${COLORS.supplier}20`,
          border: `1px solid ${COLORS.supplier}50`,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Box sx={{ width: '4px', height: '60px', backgroundColor: COLORS.supplier, borderRadius: '2px', flexShrink: 0 }} />
      
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#e0e0e0', mb: 0.5 }}>
          {supplier.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: '0.8rem', color: '#b0b0b0' }}>
            👤 {supplier.contact}
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#b0b0b0' }}>
            📧 {supplier.email}
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#b0b0b0' }}>
            📱 {supplier.phone}
          </Typography>
        </Box>
        {supplier.notes && <Typography sx={{ fontSize: '0.75rem', color: '#909090', mt: 0.5, fontStyle: 'italic' }}>{supplier.notes}</Typography>}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
        <IconButton size="small" onClick={() => handleOpenDialog('supplier', supplier)} sx={{ color: COLORS.supplier, p: '6px' }}>
          <Edit fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => handleDelete('supplier', supplier.id)} sx={{ color: '#FF6B6B', p: '6px' }}>
          <Delete fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );

  const EquipmentCard = ({ item }: { item: Equipment }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '14px 16px',
        background: `linear-gradient(135deg, ${COLORS.equipment}15 0%, ${COLORS.equipment}08 100%)`,
        border: `1px solid ${COLORS.equipment}30`,
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0 8px 24px ${COLORS.equipment}20`,
          border: `1px solid ${COLORS.equipment}50`,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Box sx={{ width: '4px', height: '60px', backgroundColor: COLORS.equipment, borderRadius: '2px', flexShrink: 0 }} />
      
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#e0e0e0', mb: 0.5 }}>
          {item.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: '0.8rem', color: '#b0b0b0' }}>
            Ilość: {item.quantity}
          </Typography>
          {item.supplier && <Typography sx={{ fontSize: '0.8rem', color: '#b0b0b0' }}>Dostawca: {item.supplier}</Typography>}
          <Chip label={getStatusLabel(item.status)} size="small" color={getStatusColor(item.status)} sx={{ height: '20px', fontSize: '0.7rem' }} />
        </Box>
        {item.notes && <Typography sx={{ fontSize: '0.75rem', color: '#909090', mt: 0.5, fontStyle: 'italic' }}>{item.notes}</Typography>}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
        {item.link && isValidUrl(ensureUrlProtocol(item.link)) && (
          <MuiLink 
            href={ensureUrlProtocol(item.link)}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: COLORS.equipment,
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: 500,
              padding: '6px 10px',
              borderRadius: '5px',
              backgroundColor: `${COLORS.equipment}12`,
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              '&:hover': {
                backgroundColor: `${COLORS.equipment}20`,
                gap: '6px'
              }
            }}
          >
            <OpenInNew sx={{ fontSize: '0.95rem' }} />
            Link
          </MuiLink>
        )}
        <IconButton size="small" onClick={() => handleOpenDialog('equipment', item)} sx={{ color: COLORS.equipment, p: '6px' }}>
          <Edit fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => handleDelete('equipment', item.id)} sx={{ color: '#FF6B6B', p: '6px' }}>
          <Delete fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#e0e0e0', mb: 3 }}>
        Procurement & Zaopatrzenie
      </Typography>
      
      <Box sx={{ borderBottom: '1px solid #2a2a2a', mb: 0 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: '#b0b0b0',
              textTransform: 'none',
              fontSize: '0.9rem',
              fontWeight: 500
            },
            '& .Mui-selected': {
              color: '#e0e0e0'
            },
            '& .MuiTabs-indicator': {
              height: '3px'
            }
          }}
        >
          <Tab label={`Kosztorysy (${costEstimates.length})`} />
          <Tab label={`Dostawcy (${suppliers.length})`} />
          <Tab label={`Wyposażenie (${equipment.length})`} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button 
            variant="contained" 
            onClick={() => handleOpenDialog('costEstimate')}
            startIcon={<AddIcon />}
            sx={{ backgroundColor: COLORS.costEstimate, '&:hover': { backgroundColor: '#45a049' } }}
          >
            Dodaj kosztorys
          </Button>
        </Box>
        {costEstimates.length === 0 ? (
          <Typography sx={{ color: '#b0b0b0', textAlign: 'center', py: 4 }}>
            Brak kosztorysów
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {costEstimates.map(item => <CostEstimateCard key={item.id} item={item} />)}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button 
            variant="contained" 
            onClick={() => handleOpenDialog('supplier')}
            startIcon={<AddIcon />}
            sx={{ backgroundColor: COLORS.supplier, '&:hover': { backgroundColor: '#7B1FA2' } }}
          >
            Dodaj dostawcę
          </Button>
        </Box>
        {suppliers.length === 0 ? (
          <Typography sx={{ color: '#b0b0b0', textAlign: 'center', py: 4 }}>
            Brak dostawców
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {suppliers.map(supplier => <SupplierCard key={supplier.id} supplier={supplier} />)}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button 
            variant="contained" 
            onClick={() => handleOpenDialog('equipment')}
            startIcon={<AddIcon />}
            sx={{ backgroundColor: COLORS.equipment, '&:hover': { backgroundColor: '#1976D2' } }}
          >
            Dodaj wyposażenie
          </Button>
        </Box>
        {equipment.length === 0 ? (
          <Typography sx={{ color: '#b0b0b0', textAlign: 'center', py: 4 }}>
            Brak wyposażenia
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {equipment.map(item => <EquipmentCard key={item.id} item={item} />)}
          </Box>
        )}
      </TabPanel>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#1e1e1e', color: '#e0e0e0' }}>
          {dialogType === 'costEstimate' && (editingId ? 'Edytuj kosztorys' : 'Dodaj kosztorys')}
          {dialogType === 'supplier' && (editingId ? 'Edytuj dostawcę' : 'Dodaj dostawcę')}
          {dialogType === 'equipment' && (editingId ? 'Edytuj wyposażenie' : 'Dodaj wyposażenie')}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2, backgroundColor: '#1e1e1e' }}>
          {dialogType === 'costEstimate' && (
            <>
              <TextField label="Nazwa" value={costFormData.name} onChange={(e) => setCostFormData({ ...costFormData, name: e.target.value })} fullWidth sx={{ '& .MuiOutlinedInput-root': { color: '#e0e0e0' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }} />
              <TextField label="Ilość" type="number" value={costFormData.quantity} onChange={(e) => setCostFormData({ ...costFormData, quantity: parseFloat(e.target.value) })} fullWidth sx={{ '& .MuiOutlinedInput-root': { color: '#e0e0e0' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }} />
              <TextField label="Cena jednostkowa (zł)" type="number" value={costFormData.unitPrice} onChange={(e) => setCostFormData({ ...costFormData, unitPrice: parseFloat(e.target.value) })} fullWidth sx={{ '& .MuiOutlinedInput-root': { color: '#e0e0e0' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }} />
              <TextField label="Link do produktu" value={costFormData.link || ''} onChange={(e) => setCostFormData({ ...costFormData, link: e.target.value })} fullWidth sx={{ '& .MuiOutlinedInput-root': { color: '#e0e0e0' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }} />
              <TextField label="Notatki" value={costFormData.notes || ''} onChange={(e) => setCostFormData({ ...costFormData, notes: e.target.value })} multiline rows={3} fullWidth sx={{ '& .MuiOutlinedInput-root': { color: '#e0e0e0' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }} />
            </>
          )}
          {dialogType === 'supplier' && (
            <>
              <TextField label="Nazwa" value={supplierFormData.name} onChange={(e) => setSupplierFormData({ ...supplierFormData, name: e.target.value })} fullWidth sx={{ '& .MuiOutlinedInput-root': { color: '#e0e0e0' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }} />
              <TextField label="Osoba kontaktowa" value={supplierFormData.contact} onChange={(e) => setSupplierFormData({ ...supplierFormData, contact: e.target.value })} fullWidth sx={{ '& .MuiOutlinedInput-root': { color: '#e0e0e0' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }} />
              <TextField label="Email" type="email" value={supplierFormData.email} onChange={(e) => setSupplierFormData({ ...supplierFormData, email: e.target.value })} fullWidth sx={{ '& .MuiOutlinedInput-root': { color: '#e0e0e0' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }} />
              <TextField label="Telefon" value={supplierFormData.phone} onChange={(e) => setSupplierFormData({ ...supplierFormData, phone: e.target.value })} fullWidth sx={{ '& .MuiOutlinedInput-root': { color: '#e0e0e0' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }} />
              <TextField label="Notatki" value={supplierFormData.notes || ''} onChange={(e) => setSupplierFormData({ ...supplierFormData, notes: e.target.value })} multiline rows={3} fullWidth sx={{ '& .MuiOutlinedInput-root': { color: '#e0e0e0' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }} />
            </>
          )}
          {dialogType === 'equipment' && (
            <>
              <TextField label="Nazwa" value={equipmentFormData.name} onChange={(e) => setEquipmentFormData({ ...equipmentFormData, name: e.target.value })} fullWidth sx={{ '& .MuiOutlinedInput-root': { color: '#e0e0e0' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }} />
              <TextField label="Ilość" type="number" value={equipmentFormData.quantity} onChange={(e) => setEquipmentFormData({ ...equipmentFormData, quantity: parseFloat(e.target.value) })} fullWidth sx={{ '& .MuiOutlinedInput-root': { color: '#e0e0e0' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }} />
              <TextField label="Cena jednostkowa (zł)" type="number" value={equipmentFormData.unitPrice} onChange={(e) => setEquipmentFormData({ ...equipmentFormData, unitPrice: parseFloat(e.target.value) })} fullWidth sx={{ '& .MuiOutlinedInput-root': { color: '#e0e0e0' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }} />
              <TextField label="Dostawca" value={equipmentFormData.supplier || ''} onChange={(e) => setEquipmentFormData({ ...equipmentFormData, supplier: e.target.value })} fullWidth sx={{ '& .MuiOutlinedInput-root': { color: '#e0e0e0' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }} />
              <TextField select label="Status" value={equipmentFormData.status || 'pending'} onChange={(e) => setEquipmentFormData({ ...equipmentFormData, status: e.target.value as any })} fullWidth sx={{ '& .MuiOutlinedInput-root': { color: '#e0e0e0' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }}>
                <MenuItem value="pending">Oczekujące</MenuItem>
                <MenuItem value="ordered">Zamówione</MenuItem>
                <MenuItem value="received">Otrzymane</MenuItem>
              </TextField>
              <TextField label="Link do produktu" value={equipmentFormData.link || ''} onChange={(e) => setEquipmentFormData({ ...equipmentFormData, link: e.target.value })} fullWidth sx={{ '& .MuiOutlinedInput-root': { color: '#e0e0e0' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }} />
              <TextField label="Notatki" value={equipmentFormData.notes || ''} onChange={(e) => setEquipmentFormData({ ...equipmentFormData, notes: e.target.value })} multiline rows={3} fullWidth sx={{ '& .MuiOutlinedInput-root': { color: '#e0e0e0' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }} />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#1e1e1e', p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ color: '#e0e0e0' }}>Anuluj</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            sx={{
              backgroundColor: dialogType === 'costEstimate' ? COLORS.costEstimate : dialogType === 'supplier' ? COLORS.supplier : COLORS.equipment,
              '&:hover': { backgroundColor: dialogType === 'costEstimate' ? '#45a049' : dialogType === 'supplier' ? '#7B1FA2' : '#1976D2' }
            }}
          >
            {editingId ? 'Aktualizuj' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Procurement;