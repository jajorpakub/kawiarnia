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
  Link as MuiLink,
  Typography
} from '@mui/material';
import { Edit, Delete, Add as AddIcon, OpenInNew, LocationOn } from '@mui/icons-material';
import { useFirebase } from '../context/FirebaseContext';
import { Location } from '../types';

const LOCATION_COLOR = '#FF5722';

export const Locations: React.FC = () => {
  const { locations, addLocation, updateLocation, deleteLocation } = useFirebase();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Location, 'id'>>({
    street: '',
    squareMeters: 0,
    monthlyRent: 0,
    link: '',
    status: 'viewing',
    notes: ''
  });

  const handleOpenDialog = (location?: Location) => {
    if (location) {
      setFormData(location);
      setEditingId(location.id);
    } else {
      setFormData({
        street: '',
        squareMeters: 0,
        monthlyRent: 0,
        link: '',
        status: 'viewing',
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
    if (!formData.street.trim()) return;

    if (editingId) {
      await updateLocation(editingId, formData);
    } else {
      await addLocation(formData);
    }
    handleCloseDialog();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten lokal?')) {
      await deleteLocation(id);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'interested':
        return 'info';
      case 'negotiating':
        return 'warning';
      case 'viewing':
        return 'default';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status?: string) => {
    const labels: { [key: string]: string } = {
      'viewing': 'Oglądane',
      'interested': 'Zainteresowane',
      'negotiating': 'Negocjacje',
      'rejected': 'Odrzucone'
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

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#e0e0e0' }}>
          Lokale
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => handleOpenDialog()}
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: LOCATION_COLOR,
            '&:hover': {
              backgroundColor: '#E64A19'
            }
          }}
        >
          Dodaj lokal
        </Button>
      </Box>

      {locations.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <LocationOn sx={{ fontSize: 48, color: LOCATION_COLOR, mb: 2 }} />
          <Typography sx={{ color: '#b0b0b0', mb: 3 }}>
            Nie ma jeszcze żadnych lokali
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => handleOpenDialog()}
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: LOCATION_COLOR,
              '&:hover': {
                backgroundColor: '#E64A19'
              }
            }}
          >
            Dodaj pierwszy lokal
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr' }, gap: 2 }}>
          {locations.map((location) => (
            <Box
              key={location.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                padding: '14px 16px',
                background: `linear-gradient(135deg, ${LOCATION_COLOR}15 0%, ${LOCATION_COLOR}08 100%)`,
                border: `1px solid ${LOCATION_COLOR}30`,
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0 8px 24px ${LOCATION_COLOR}20`,
                  border: `1px solid ${LOCATION_COLOR}50`,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {/* Left bar */}
              <Box sx={{ width: '4px', height: '60px', backgroundColor: LOCATION_COLOR, borderRadius: '2px', flexShrink: 0 }} />

              {/* Content */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  sx={{ 
                    fontSize: '1rem', 
                    fontWeight: 600, 
                    color: '#e0e0e0',
                    mb: 0.5
                  }}
                >
                  {location.street}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#b0b0b0' }}>
                    📐 {location.squareMeters} m²
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#b0b0b0' }}>
                    💰 {location.monthlyRent.toFixed(2)} zł/m-c
                  </Typography>
                  <Chip
                    label={getStatusLabel(location.status)}
                    size="small"
                    color={getStatusColor(location.status)}
                    sx={{ height: '20px', fontSize: '0.7rem' }}
                  />
                </Box>
                {location.notes && (
                  <Typography sx={{ fontSize: '0.75rem', color: '#909090', mt: 0.8, fontStyle: 'italic' }}>
                    {location.notes}
                  </Typography>
                )}
              </Box>

              {/* Actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                {location.link && isValidUrl(ensureUrlProtocol(location.link)) ? (
                  <MuiLink 
                    href={ensureUrlProtocol(location.link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: LOCATION_COLOR,
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      padding: '6px 10px',
                      borderRadius: '5px',
                      backgroundColor: `${LOCATION_COLOR}12`,
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        backgroundColor: `${LOCATION_COLOR}20`,
                        gap: '6px'
                      }
                    }}
                  >
                    <OpenInNew sx={{ fontSize: '0.95rem' }} />
                    Link
                  </MuiLink>
                ) : null}

                <IconButton 
                  size="small" 
                  onClick={() => handleOpenDialog(location)}
                  sx={{ color: LOCATION_COLOR, p: '6px' }}
                >
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleDelete(location.id)}
                  sx={{ color: '#FF6B6B', p: '6px' }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#1e1e1e', color: '#e0e0e0' }}>
          {editingId ? 'Edytuj lokal' : 'Dodaj nowy lokal'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2, backgroundColor: '#1e1e1e' }}>
          <TextField
            label="Ulica / Adres"
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
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
            label="Metraż (m²)"
            type="number"
            value={formData.squareMeters}
            onChange={(e) => setFormData({ ...formData, squareMeters: parseFloat(e.target.value) || 0 })}
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
            label="Czynsz miesięczny (zł)"
            type="number"
            value={formData.monthlyRent}
            onChange={(e) => setFormData({ ...formData, monthlyRent: parseFloat(e.target.value) || 0 })}
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
            label="Link do ogłoszenia"
            value={formData.link || ''}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            fullWidth
            placeholder="https://..."
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
            label="Status"
            value={formData.status || 'viewing'}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Location['status'] })}
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
            <MenuItem value="viewing">Oglądane</MenuItem>
            <MenuItem value="interested">Zainteresowane</MenuItem>
            <MenuItem value="negotiating">Negocjacje</MenuItem>
            <MenuItem value="rejected">Odrzucone</MenuItem>
          </TextField>
          <TextField
            label="Notatki"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            multiline
            rows={4}
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
              backgroundColor: LOCATION_COLOR,
              '&:hover': {
                backgroundColor: '#E64A19'
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

export default Locations;