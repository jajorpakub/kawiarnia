import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { CostEstimateItem, Supplier, Equipment, Task, Financing, CalendarEvent } from '../types';

interface FirebaseContextType {
  costEstimates: CostEstimateItem[];
  addCostEstimate: (item: Omit<CostEstimateItem, 'id'>) => Promise<string>;
  updateCostEstimate: (id: string, item: Partial<CostEstimateItem>) => Promise<void>;
  deleteCostEstimate: (id: string) => Promise<void>;

  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<string>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;

  equipment: Equipment[];
  addEquipment: (item: Omit<Equipment, 'id'>) => Promise<string>;
  updateEquipment: (id: string, item: Partial<Equipment>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;

  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => Promise<string>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  financing: Financing[];
  addFinancing: (item: Omit<Financing, 'id'>) => Promise<string>;
  updateFinancing: (id: string, item: Partial<Financing>) => Promise<void>;
  deleteFinancing: (id: string) => Promise<void>;

  events: CalendarEvent[];
  addEvent: (item: Omit<CalendarEvent, 'id'>) => Promise<string>;
  updateEvent: (id: string, item: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [costEstimates, setCostEstimates] = useState<CostEstimateItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [financing, setFinancing] = useState<Financing[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribes = [
      onSnapshot(collection(db, 'costEstimates'), (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as CostEstimateItem));
        setCostEstimates(data);
      }),

      onSnapshot(collection(db, 'suppliers'), (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as Supplier));
        setSuppliers(data);
      }),

      onSnapshot(collection(db, 'equipment'), (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as Equipment));
        setEquipment(data);
      }),

      onSnapshot(collection(db, 'tasks'), (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as Task));
        setTasks(data);
      }),

      onSnapshot(collection(db, 'financing'), (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as Financing));
        setFinancing(data);
      }),

      onSnapshot(collection(db, 'events'), (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as CalendarEvent));
        setEvents(data);
      })
    ];

    setLoading(false);

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  const addCostEstimate = async (item: Omit<CostEstimateItem, 'id'>) => {
    const docRef = await addDoc(collection(db, 'costEstimates'), {
      ...item,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  };

  const updateCostEstimate = async (id: string, item: Partial<CostEstimateItem>) => {
    await updateDoc(doc(db, 'costEstimates', id), {
      ...item,
      updatedAt: Timestamp.now()
    });
  };

  const deleteCostEstimate = async (id: string) => {
    await deleteDoc(doc(db, 'costEstimates', id));
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    const docRef = await addDoc(collection(db, 'suppliers'), {
      ...supplier,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  };

  const updateSupplier = async (id: string, supplier: Partial<Supplier>) => {
    await updateDoc(doc(db, 'suppliers', id), {
      ...supplier,
      updatedAt: Timestamp.now()
    });
  };

  const deleteSupplier = async (id: string) => {
    await deleteDoc(doc(db, 'suppliers', id));
  };

  const addEquipment = async (item: Omit<Equipment, 'id'>) => {
    const docRef = await addDoc(collection(db, 'equipment'), {
      ...item,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  };

  const updateEquipment = async (id: string, item: Partial<Equipment>) => {
    await updateDoc(doc(db, 'equipment', id), {
      ...item,
      updatedAt: Timestamp.now()
    });
  };

  const deleteEquipment = async (id: string) => {
    await deleteDoc(doc(db, 'equipment', id));
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...task,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  };

  const updateTask = async (id: string, task: Partial<Task>) => {
    await updateDoc(doc(db, 'tasks', id), {
      ...task,
      updatedAt: Timestamp.now()
    });
  };

  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, 'tasks', id));
  };

  const addFinancing = async (item: Omit<Financing, 'id'>) => {
    const docRef = await addDoc(collection(db, 'financing'), {
      ...item,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  };

  const updateFinancing = async (id: string, item: Partial<Financing>) => {
    await updateDoc(doc(db, 'financing', id), {
      ...item,
      updatedAt: Timestamp.now()
    });
  };

  const deleteFinancing = async (id: string) => {
    await deleteDoc(doc(db, 'financing', id));
  };

  const addEvent = async (item: Omit<CalendarEvent, 'id'>) => {
    const docRef = await addDoc(collection(db, 'events'), {
      ...item,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  };

  const updateEvent = async (id: string, item: Partial<CalendarEvent>) => {
    await updateDoc(doc(db, 'events', id), {
      ...item,
      updatedAt: Timestamp.now()
    });
  };

  const deleteEvent = async (id: string) => {
    await deleteDoc(doc(db, 'events', id));
  };

  const value: FirebaseContextType = {
    costEstimates,
    addCostEstimate,
    updateCostEstimate,
    deleteCostEstimate,
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    equipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    financing,
    addFinancing,
    updateFinancing,
    deleteFinancing,
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    loading
  };

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within FirebaseProvider');
  }
  return context;
};
