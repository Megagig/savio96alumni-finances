// User related types
export enum UserRole {
  ADMIN = 'admin', // Legacy admin role
  MEMBER = 'member',
  ADMIN_LEVEL_1 = 'admin_level_1',
  ADMIN_LEVEL_2 = 'admin_level_2',
  SUPER_ADMIN = 'super_admin'
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phoneNumber: string;
  address?: string;
  membershipId?: string;
  dateJoined: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Payment related types
export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum PaymentType {
  DUE = 'due',
  LEVY = 'levy',
  PLEDGE = 'pledge',
  DONATION = 'donation',
  LOAN_REPAYMENT = 'loan_repayment'
}

export interface Payment {
  _id: string;
  user: User | string;
  amount: number;
  description: string;
  paymentDate: string;
  receiptUrl?: string;
  status: PaymentStatus;
  approvedBy?: User | string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Due related types
export interface Due {
  _id: string;
  name: string;
  amount: number;
  dueDate: string;
  description?: string;
  isRecurring: boolean;
  frequency?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberDue {
  _id: string;
  user: User | string;
  due: Due | string;
  amountPaid: number;
  balance: number;
  status: PaymentStatus;
  paymentId?: Payment | string;
  createdAt: string;
  updatedAt: string;
}

// Pledge related types
export interface Pledge {
  _id: string;
  user: User | string;
  amount: number;
  title: string;
  description?: string;
  pledgeDate: string;
  fulfillmentDate?: string;
  status: PaymentStatus;
  paymentId?: Payment | string;
  createdAt: string;
  updatedAt: string;
}

// Donation related types
export interface Donation {
  _id: string;
  user: User | string;
  amount: number;
  purpose: string;
  description?: string;
  donationDate: string;
  status: PaymentStatus;
  paymentId?: Payment | string;
  createdAt: string;
  updatedAt: string;
}

// Levy related types
export interface Levy {
  _id: string;
  title: string;
  amount: number;
  description?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MemberLevy {
  _id: string;
  user: User | string;
  levy: Levy | string;
  amountPaid: number;
  balance: number;
  status: PaymentStatus;
  paymentId?: Payment | string;
  createdAt: string;
  updatedAt: string;
}

// Loan related types
export enum LoanStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid'
}

export interface Loan {
  _id: string;
  user: User | string;
  amount: number;
  purpose: string;
  applicationDate: string;
  approvalDate?: string;
  repaymentDate?: string;
  interestRate: number;
  status: LoanStatus;
  approvedBy?: User | string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanRepayment {
  _id: string;
  loan: Loan | string;
  user: User | string;
  amount: number;
  repaymentDate: string;
  receiptUrl?: string;
  status: PaymentStatus;
  approvedBy?: User | string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Transaction related types
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export interface Transaction {
  _id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  description?: string;
  date: string;
  recordedBy: User | string;
  relatedPayment?: Payment | string;
  createdAt: string;
  updatedAt: string;
}

// Financial summary type
export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  incomeByCategory: {
    _id: string;
    total: number;
  }[];
  expensesByCategory: {
    _id: string;
    total: number;
  }[];
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}
