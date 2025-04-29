// React is used implicitly for JSX
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import { UserRole } from './types';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Layout Components
import MainLayout from './components/layout/MainLayout';

// Landing Pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Dashboard Pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import MemberDashboard from './pages/dashboard/MemberDashboard';

// Member Pages
import PaymentsPage from './pages/member/PaymentsPage';
import LoansPage from './pages/member/LoansPage';
import SettingsPage from './pages/member/SettingsPage';
import SupportPage from './pages/member/SupportPage';
import MakePaymentForm from './pages/member/MakePaymentForm';
import MakePledgeForm from './pages/member/MakePledgeForm';
import MakeDonationForm from './pages/member/MakeDonationForm';
import ApplyLoanForm from './pages/member/ApplyLoanForm';

// Admin Pages
import MembersPage from './pages/admin/MembersPage';
import { default as AdminPaymentsPage } from './pages/admin/PaymentsPage';
import { default as AdminLoansPage } from './pages/admin/LoansPage';
import AccountingPage from './pages/admin/AccountingPage';
import { default as AdminSettingsPage } from './pages/admin/SettingsPage';
import { default as AdminSupportPage } from './pages/admin/SupportPage';
import FormsPage from './pages/admin/FormsPage';
import DonationsPage from './pages/admin/DonationsPage';

// Admin Form Pages
import AddMemberForm from './pages/admin/AddMemberForm';
import CreateDueForm from './pages/admin/forms/CreateDueForm';
import CreateLevyForm from './pages/admin/forms/CreateLevyForm';
import RecordTransactionForm from './pages/admin/forms/RecordTransactionForm';

// Protected route component with layout
const ProtectedRoute = ({ allowedRoles }: { allowedRoles: UserRole[] }) => {
  const { isAuthenticated, isLoading, user, checkAuthStatus } = useAuth();
  const [hasChecked, setHasChecked] = useState(false);

  // Re-check auth status when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated && !isLoading) {
        await checkAuthStatus();
      }
      setHasChecked(true);
    };
    
    checkAuth();
  }, []);

  // If still loading or hasn't checked auth yet, show loading spinner
  if (isLoading || !hasChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent align-[-0.125em]"></div>
          <p className="mt-2 text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated after checking, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  // If user doesn't have the required role, redirect to appropriate dashboard
  if (user && !allowedRoles.includes(user.role)) {
    return user.role === UserRole.ADMIN || user.role === UserRole.ADMIN_LEVEL_1 || user.role === UserRole.ADMIN_LEVEL_2 || user.role === UserRole.SUPER_ADMIN ? 
      <Navigate to="/admin" replace /> : 
      <Navigate to="/" replace />;
  }

  // User is authenticated and has the correct role
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/members" element={<MembersPage />} />
            <Route path="/admin/members/new" element={<AddMemberForm />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
            <Route path="/admin/donations" element={<DonationsPage />} />
            <Route path="/admin/loans" element={<AdminLoansPage />} />
            <Route path="/admin/accounting" element={<AccountingPage />} />
            <Route path="/admin/accounting/new-transaction" element={<RecordTransactionForm />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/support" element={<AdminSupportPage />} />
            <Route path="/admin/forms" element={<FormsPage />} />
            <Route path="/admin/dues/new" element={<CreateDueForm />} />
            <Route path="/admin/levies/new" element={<CreateLevyForm />} />
          </Route>
          
          {/* Member Routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.MEMBER]} />}>
            <Route path="/" element={<MemberDashboard />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/payments/new" element={<MakePaymentForm />} />
            <Route path="/pledges/new" element={<MakePledgeForm />} />
            <Route path="/donations/new" element={<MakeDonationForm />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/loans/new" element={<ApplyLoanForm />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/support" element={<SupportPage />} />
          </Route>
          
          {/* Default redirect */}
          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Component to redirect users based on their role
const DefaultRedirect = () => {
  const { user, isAuthenticated, isLoading, checkAuthStatus } = useAuth();
  const [hasChecked, setHasChecked] = useState(false);

  // Re-check auth status when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated && !isLoading) {
        await checkAuthStatus();
      }
      setHasChecked(true);
    };
    
    checkAuth();
  }, []);

  if (isLoading || !hasChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent align-[-0.125em]"></div>
          <p className="mt-2 text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  if (user?.role === UserRole.ADMIN || user?.role === UserRole.ADMIN_LEVEL_1 || user?.role === UserRole.ADMIN_LEVEL_2 || user?.role === UserRole.SUPER_ADMIN) {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/" replace />;
};

export default App;
