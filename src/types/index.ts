export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  mpesaNumber: string;
  pin: string;
  createdAt: Date;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'send' | 'receive' | 'deposit' | 'withdraw';
  amount: number;
  recipientPhone?: string;
  recipientName?: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface SavingsAccount {
  id: string;
  userId: string;
  balance: number;
  targetAmount?: number;
  targetDate?: Date;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AppState {
  auth: AuthState;
  transactions: Transaction[];
  savings: SavingsAccount;
}
