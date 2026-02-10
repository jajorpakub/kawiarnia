import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Button,
  ButtonGroup,
  Tooltip,
  TextField,
  Typography,
  CircularProgress,
  Input,
} from '@mui/material';
import {
  Brush as BrushIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SaveAs as SaveIcon,
  Undo as UndoIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { db } from '../firebase/config';
import { doc, setDoc, onSnapshot, Timestamp } from 'firebase/firestore';

interface DrawingAction {
  type: 'stroke' | 'text' | 'clear';
  data?: any;
  timestamp: number;
}

interface WhiteboardData {
  actions: DrawingAction[];
  textBoxes?: TextBox[];
  lastUpdated: any;
}

interface TextBox {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
}

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<'draw' | 'text'>('draw');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [history, setHistory] = useState<DrawingAction[]>([]);
  const [fontSize, setFontSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [tempTextInput, setTempTextInput] = useState('');

  const lastSyncRef = useRef<number>(0);
  const pendingActionsRef = useRef<DrawingAction[]>([]);
  const currentStrokeRef = useRef<{ x: number; y: number }[]>([]);
  const draggedTextRef = useRef<{ id: string; startX: number; startY: number; originalX: number; originalY: number } | null>(null);

  // Effect dla ładowania i nasłuchiwania Firebase
  useEffect(() => {
    // Nasłuchuj zmian w Firebase
    const unsubscribe = onSnapshot(
      doc(db, 'whiteboard', 'shared'),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as WhiteboardData;
          setHistory(data.actions || []);
          setTextBoxes(data.textBoxes || []);
        } else {
          setHistory([]);
          setTextBoxes([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Błąd przy ładowaniu tablicy:', error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Effect dla inicjalizacji canvas i rysowania
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Funkcja rysowania akcji
    const redrawCanvas = (actions: DrawingAction[]) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Wyczyść i narysuj białe tło
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Odtwórz wszystkie akcje
      actions.forEach((action) => {
        if (action.type === 'stroke') {
          const { points, color: strokeColor, lineWidth: strokeWidth } = action.data;
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = strokeWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          if (points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
              ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.stroke();
          }
        }
      });

      // Narysuj text boxy
      textBoxes.forEach((textBox) => {
        ctx.font = `${textBox.fontSize}px Arial`;
        ctx.fillStyle = textBox.color;
        ctx.textBaseline = 'top';
        ctx.fillText(textBox.text, textBox.x, textBox.y);

        // Narysuj prostokąt wokół wybranego tekstu
        if (selectedTextId === textBox.id) {
          const metrics = ctx.measureText(textBox.text);
          const width = metrics.width;
          const height = textBox.fontSize;

          ctx.strokeStyle = '#0000ff';
          ctx.lineWidth = 2;
          ctx.strokeRect(textBox.x - 2, textBox.y - 2, width + 4, height + 4);
        }
      });
    };

    // Ustaw rozmiar kanwy na rozmiar okna
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      redrawCanvas(history);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Narysuj początkową zawartość
    redrawCanvas(history);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [history, textBoxes, selectedTextId]);

  const saveToFirebase = useCallback(async (actions: DrawingAction[], texts: TextBox[]) => {
    try {
      setSyncing(true);
      await setDoc(doc(db, 'whiteboard', 'shared'), {
        actions,
        textBoxes: texts,
        lastUpdated: Timestamp.now(),
      });
      lastSyncRef.current = Date.now();
    } catch (error) {
      console.error('Błąd przy zapisywaniu tablicy:', error);
    } finally {
      setSyncing(false);
    }
  }, []);

  // Funkcja do sprawdzenia, czy pozycja jest wewnątrz tekstu
  const getTextBoxAtPosition = (x: number, y: number): TextBox | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    for (const textBox of textBoxes) {
      ctx.font = `${textBox.fontSize}px Arial`;
      const metrics = ctx.measureText(textBox.text);
      const width = metrics.width;
      const height = textBox.fontSize;

      if (
        x >= textBox.x - 2 &&
        x <= textBox.x + width + 2 &&
        y >= textBox.y - 2 &&
        y <= textBox.y + height + 2
      ) {
        return textBox;
      }
    }
    return null;
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'draw') {
      setIsDrawing(true);
      currentStrokeRef.current = [{ x, y }];

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    } else if (mode === 'text') {
      // Sprawdź czy klikasz na istniejący tekst
      const clickedTextBox = getTextBoxAtPosition(x, y);

      if (clickedTextBox) {
        // Zaznacz tekst do edycji
        setSelectedTextId(clickedTextBox.id);
        draggedTextRef.current = {
          id: clickedTextBox.id,
          startX: x,
          startY: y,
          originalX: clickedTextBox.x,
          originalY: clickedTextBox.y,
        };
      } else {
        // Stwórz nowy tekst
        setEditingTextId(`new-${Date.now()}`);
        setTempTextInput('');
        setSelectedTextId(null);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mode !== 'draw') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Zbierz punkt dla tego udaru
    currentStrokeRef.current.push({ x, y });

    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode === 'text' && draggedTextRef.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const deltaX = x - draggedTextRef.current.startX;
      const deltaY = y - draggedTextRef.current.startY;

      const updatedTextBoxes = textBoxes.map((tb) =>
        tb.id === draggedTextRef.current!.id
          ? {
              ...tb,
              x: draggedTextRef.current!.originalX + deltaX,
              y: draggedTextRef.current!.originalY + deltaY,
            }
          : tb
      );

      setTextBoxes(updatedTextBoxes);
    } else {
      draw(e);
    }
  };

  const stopDrawing = async () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.closePath();
    }

    // Zapisz kompletny udar z wszystkimi zebranymi punktami
    if (currentStrokeRef.current.length > 0) {
      const newAction: DrawingAction = {
        type: 'stroke',
        data: {
          points: currentStrokeRef.current,
          color,
          lineWidth,
        },
        timestamp: Date.now(),
      };

      const updatedHistory = [...history, newAction];
      setHistory(updatedHistory);

      // Zapisz do Firebase
      if (Date.now() - lastSyncRef.current > 1000) {
        saveToFirebase(updatedHistory, textBoxes);
      } else {
        pendingActionsRef.current = updatedHistory;
      }

      currentStrokeRef.current = [];
    }

    // Zapisz zmianę pozycji tekstu jeśli był przeciągany
    if (draggedTextRef.current) {
      saveToFirebase(history, textBoxes);
      draggedTextRef.current = null;
    }
  };

  const handleAddText = async (newText: string, textId: string) => {
    if (!newText.trim()) return;

    const isNewText = textId.startsWith('new-');

    if (isNewText) {
      const newTextBox: TextBox = {
        id: textId,
        x: 50,
        y: 50,
        text: newText,
        fontSize,
        color,
      };

      const updatedTextBoxes = [...textBoxes, newTextBox];
      setTextBoxes(updatedTextBoxes);
      saveToFirebase(history, updatedTextBoxes);
    } else {
      const updatedTextBoxes = textBoxes.map((tb) =>
        tb.id === textId ? { ...tb, text: newText } : tb
      );
      setTextBoxes(updatedTextBoxes);
      saveToFirebase(history, updatedTextBoxes);
    }

    setEditingTextId(null);
    setTempTextInput('');
  };

  const clearCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const updatedHistory: DrawingAction[] = [
      {
        type: 'clear',
        timestamp: Date.now(),
      },
    ];

    setHistory(updatedHistory);
    setTextBoxes([]);
    saveToFirebase(updatedHistory, []);
  };

  const undo = () => {
    if (history.length === 0) return;

    const updatedHistory = history.slice(0, -1);
    setHistory(updatedHistory);
    saveToFirebase(updatedHistory, textBoxes);
  };

  const deleteSelectedText = async () => {
    if (!selectedTextId) return;

    const updatedTextBoxes = textBoxes.filter((tb) => tb.id !== selectedTextId);
    setTextBoxes(updatedTextBoxes);
    setSelectedTextId(null);
    saveToFirebase(history, updatedTextBoxes);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `tablica-${new Date().toISOString().split('T')[0]}.png`;
    link.click();
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', gap: 2 }}>
      <Paper sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">Tablica Wspólna</Typography>
          {syncing && <CircularProgress size={20} />}
        </Box>

        {/* Przycisk trybu */}
        <ButtonGroup size="small">
          <Tooltip title="Tryb rysowania ołówkiem">
            <Button
              onClick={() => setMode('draw')}
              variant={mode === 'draw' ? 'contained' : 'outlined'}
              startIcon={<BrushIcon />}
            >
              Rysuj
            </Button>
          </Tooltip>
          <Tooltip title="Tryb pisania tekstu">
            <Button
              onClick={() => setMode('text')}
              variant={mode === 'text' ? 'contained' : 'outlined'}
              startIcon={<EditIcon />}
            >
              Tekst
            </Button>
          </Tooltip>
        </ButtonGroup>

        {/* Kolory i grubość */}
        {mode === 'draw' && (
          <>
            <Tooltip title="Kolor pędzla">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaletteIcon fontSize="small" />
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{ width: '50px', height: '40px', cursor: 'pointer', border: 'none' }}
                />
              </Box>
            </Tooltip>

            <TextField
              label="Grubość linii"
              type="number"
              size="small"
              value={lineWidth}
              onChange={(e) => setLineWidth(Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1, max: 50, step: 1 }}
              sx={{ width: '120px' }}
            />
          </>
        )}

        {/* Rozmiar czcionki i kolor dla tekstu */}
        {mode === 'text' && (
          <>
            <Tooltip title="Kolor tekstu">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaletteIcon fontSize="small" />
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{ width: '50px', height: '40px', cursor: 'pointer', border: 'none' }}
                />
              </Box>
            </Tooltip>

            <TextField
              label="Rozmiar czcionki"
              type="number"
              size="small"
              value={fontSize}
              onChange={(e) => setFontSize(Math.max(8, parseInt(e.target.value) || 20))}
              inputProps={{ min: 8, max: 100, step: 4 }}
              sx={{ width: '120px' }}
            />
          </>
        )}

        {/* Przyciski akcji */}
        <Tooltip title="Cofnij ostatnią operację">
          <Button
            onClick={undo}
            variant="outlined"
            size="small"
            startIcon={<UndoIcon />}
            disabled={history.length === 0}
          >
            Cofnij
          </Button>
        </Tooltip>

        {selectedTextId && (
          <Tooltip title="Usuń zaznaczony tekst">
            <Button
              onClick={deleteSelectedText}
              variant="outlined"
              size="small"
              startIcon={<DeleteIcon />}
              color="error"
            >
              Usuń tekst
            </Button>
          </Tooltip>
        )}

        <Tooltip title="Usuń całą zawartość tablicy">
          <Button
            onClick={clearCanvas}
            variant="outlined"
            size="small"
            startIcon={<DeleteIcon />}
            color="error"
          >
            Wyczyść
          </Button>
        </Tooltip>

        <Tooltip title="Pobierz tablicę jako obraz">
          <Button
            onClick={downloadCanvas}
            variant="outlined"
            size="small"
            startIcon={<SaveIcon />}
            color="success"
          >
            Pobierz
          </Button>
        </Tooltip>
      </Paper>

      {/* Input do dodawania tekstu */}
      {editingTextId && mode === 'text' && (
        <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography>Wpisz tekst:</Typography>
            <Input
              autoFocus
              value={tempTextInput}
              onChange={(e) => setTempTextInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddText(tempTextInput, editingTextId);
                }
              }}
              onBlur={() => {
                if (tempTextInput.trim()) {
                  handleAddText(tempTextInput, editingTextId);
                } else {
                  setEditingTextId(null);
                }
              }}
              placeholder="Wpisz tekst i naciśnij Enter"
              sx={{ flex: 1 }}
            />
          </Box>
        </Paper>
      )}

      {/* Canvas */}
      <Paper
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#ffffff',
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            cursor: mode === 'draw' ? 'crosshair' : 'text',
          }}
        />
      </Paper>
    </Box>
  );
};

export default Whiteboard;
