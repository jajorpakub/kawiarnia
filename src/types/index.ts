export interface CostEstimateItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  category?: string;
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
