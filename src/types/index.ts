export interface CostEstimateItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Equipment {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  supplier?: string;
  status?: 'pending' | 'ordered' | 'received';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  status?: 'todo' | 'in-progress' | 'done';
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Financing {
  id: string;
  name: string;
  type: 'credit' | 'grant' | 'loan' | 'investment' | 'other';
  amount: number;
  approvedAmount?: number;
  interestRate?: number;
  repaymentPeriod?: number;
  status?: 'applied' | 'approved' | 'rejected' | 'active' | 'completed';
  lender?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  category?: 'inspection' | 'meeting' | 'deadline' | 'other';
  color?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Location {
  id: string;
  street: string;
  squareMeters: number;
  monthlyRent: number;
  link?: string;
  status?: 'viewing' | 'interested' | 'negotiating' | 'rejected';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: 'beverage' | 'dessert' | 'snack' | 'main' | 'breakfast' | 'other';
  dietary?: 'vegan' | 'vegetarian' | 'none';
  price?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
