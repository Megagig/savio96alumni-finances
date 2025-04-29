import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { get } from '../../services/api';
import { 
  User,
  Payment, 
  Due, 
  MemberDue, 
  Levy,
  MemberLevy, 
  Pledge, 
  Donation, 
  Loan,
  PaymentStatus,
  LoanStatus,
  FinancialSummary,
  ApiResponse
} from '../../types';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    users: [] as User[],
    payments: [] as Payment[],
    dues: [] as Due[],
    memberDues: [] as MemberDue[],
    levies: [] as Levy[],
    memberLevies: [] as MemberLevy[],
    pledges: [] as Pledge[],
    donations: [] as Donation[],
    loans: [] as Loan[],
    financialSummary: {} as FinancialSummary,
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch users
        const usersResponse = await get<{ users: User[] }>('/users');
        
        // Fetch payments
        const paymentsResponse = await get<{ payments: Payment[] }>('/payments');
        
        // Fetch dues
        const duesResponse = await get<{ dues: Due[] }>('/dues');
        
        // Fetch member dues
        const memberDuesResponse = await get<{ memberDues: MemberDue[] }>('/dues/members');
        
        // Fetch levies
        const leviesResponse = await get<{ levies: Levy[] }>('/levies');
        
        // Fetch member levies
        const memberLeviesResponse = await get<{ memberLevies: MemberLevy[] }>('/levies/members');
        
        // Fetch pledges
        const pledgesResponse = await get<{ pledges: Pledge[] }>('/pledges');
        
        // Fetch donations
        const donationsResponse = await get<{ donations: Donation[] }>('/donations');
        
        // Fetch loans - only for ADMIN_LEVEL_2 and SUPER_ADMIN
        let loansResponse: ApiResponse<{ loans: Loan[] }> = { success: false, message: '', data: { loans: [] } };
        if (user?.role === 'admin_level_2' || user?.role === 'super_admin') {
          try {
            loansResponse = await get<{ loans: Loan[] }>('/loans');
          } catch (error) {
            console.log('Loans access restricted for this admin level');
          }
        }
        
        // Fetch financial summary for the current year
        const today = new Date();
        const startDate = new Date(today.getFullYear(), 0, 1).toISOString();
        const endDate = new Date(today.getFullYear(), 11, 31).toISOString();
        
        const financialSummaryResponse = await get<{ financialSummary: FinancialSummary }>(
          `/accounting/summary?startDate=${startDate}&endDate=${endDate}`
        );
        
        setDashboardData({
          users: usersResponse.success ? usersResponse.data?.users || [] : [],
          payments: paymentsResponse.success ? paymentsResponse.data?.payments || [] : [],
          dues: duesResponse.success ? duesResponse.data?.dues || [] : [],
          memberDues: memberDuesResponse.success ? memberDuesResponse.data?.memberDues || [] : [],
          levies: leviesResponse.success ? leviesResponse.data?.levies || [] : [],
          memberLevies: memberLeviesResponse.success ? memberLeviesResponse.data?.memberLevies || [] : [],
          pledges: pledgesResponse.success ? pledgesResponse.data?.pledges || [] : [],
          donations: donationsResponse.success ? donationsResponse.data?.donations || [] : [],
          loans: loansResponse.success ? loansResponse.data?.loans || [] : [],
          financialSummary: financialSummaryResponse.success 
            ? financialSummaryResponse.data?.financialSummary || {} as FinancialSummary 
            : {} as FinancialSummary,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format currency to Naira
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  // Calculate dashboard statistics
  const statistics = {
    totalMembers: dashboardData.users.filter(user => user.role === 'member').length,
    activeMembers: dashboardData.users.filter(user => user.role === 'member' && user.isActive).length,
    pendingPayments: dashboardData.payments.filter(payment => payment.status === PaymentStatus.PENDING).length,
    // Only calculate loan statistics for admin_level_2 and super_admin
    pendingLoans: (user?.role === 'admin_level_2' || user?.role === 'super_admin') ? 
      dashboardData.loans.filter(loan => loan.status === LoanStatus.PENDING).length : 0,
    totalIncome: dashboardData.financialSummary.totalIncome || 0,
    totalExpenses: dashboardData.financialSummary.totalExpenses || 0,
    netBalance: dashboardData.financialSummary.netBalance || 0,
    // Additional statistics for member activity
    totalDues: dashboardData.dues.length,
    totalLevies: dashboardData.levies.length,
    totalPledges: dashboardData.pledges.length,
    totalDonations: dashboardData.donations.length,
    // Calculate percentage of dues paid
    duesPaidPercentage: dashboardData.memberDues.length > 0 ?
      Math.round((dashboardData.memberDues.filter(due => due.balance === 0).length / dashboardData.memberDues.length) * 100) : 0,
    // Calculate percentage of levies paid
    leviesPaidPercentage: dashboardData.memberLevies.length > 0 ?
      Math.round((dashboardData.memberLevies.filter(levy => levy.balance === 0).length / dashboardData.memberLevies.length) * 100) : 0,
  };

  // Recent payments
  const recentPayments = [...dashboardData.payments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Pending loan applications - only for admin_level_2 and super_admin
  const pendingLoans = (user?.role === 'admin_level_2' || user?.role === 'super_admin') ?
    [...dashboardData.loans]
      .filter(loan => loan.status === LoanStatus.PENDING)
      .sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime())
      .slice(0, 5)
    : [];
    


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">
          Welcome back, {user?.firstName} {user?.lastName}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <svg
            className="h-8 w-8 animate-spin text-primary-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      ) : (
        <div>
          {/* Statistics cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card bg-white">
              <h3 className="text-sm font-medium text-gray-500">Total Members</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{statistics.totalMembers}</p>
              <p className="mt-1 text-sm text-gray-500">{statistics.activeMembers} active</p>
            </div>
            <div className="card bg-white">
              <h3 className="text-sm font-medium text-gray-500">Pending Payments</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{statistics.pendingPayments}</p>
              <p className="mt-1 text-sm text-gray-500">
                <Link to="/admin/payments?activeTab=pending" className="text-primary-600 hover:text-primary-500">
                  View all
                </Link>
              </p>
            </div>
            {/* Only show Pending Loans card for ADMIN_LEVEL_2 and SUPER_ADMIN */}
            {(user?.role === 'admin_level_2' || user?.role === 'super_admin') && (
              <div className="card bg-white">
                <h3 className="text-sm font-medium text-gray-500">Pending Loans</h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{statistics.pendingLoans}</p>
                <p className="mt-1 text-sm text-gray-500">
                  <Link to="/admin/loans?activeTab=pending" className="text-primary-600 hover:text-primary-500">
                    View all
                  </Link>
                </p>
              </div>
            )}
            <div className="card bg-white">
              <h3 className="text-sm font-medium text-gray-500">Net Balance</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(statistics.netBalance)}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                <Link to="/admin/accounting?view=balance" className="text-primary-600 hover:text-primary-500">
                  View details
                </Link>
              </p>
            </div>
          </div>

          {/* Additional Statistics Cards */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card bg-white">
              <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(statistics.totalIncome)}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                <Link to="/admin/accounting?view=income" className="text-primary-600 hover:text-primary-500">
                  View details
                </Link>
              </p>
            </div>
            <div className="card bg-white">
              <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(statistics.totalExpenses)}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                <Link to="/admin/accounting?view=expenses" className="text-primary-600 hover:text-primary-500">
                  View details
                </Link>
              </p>
            </div>
            <div className="card bg-white">
              <h3 className="text-sm font-medium text-gray-500">Dues Paid</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{statistics.duesPaidPercentage}%</p>
              <p className="mt-1 text-sm text-gray-500">
                <Link to="/admin/dues" className="text-primary-600 hover:text-primary-500">
                  {statistics.totalDues} total dues
                </Link>
              </p>
            </div>
            <div className="card bg-white">
              <h3 className="text-sm font-medium text-gray-500">Levies Paid</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{statistics.leviesPaidPercentage}%</p>
              <p className="mt-1 text-sm text-gray-500">
                <Link to="/admin/levies" className="text-primary-600 hover:text-primary-500">
                  {statistics.totalLevies} total levies
                </Link>
              </p>
            </div>
          </div>

          {/* Financial summary */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900">Financial Summary</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="truncate text-sm font-medium text-gray-500">Total Income</dt>
                  <dd className="mt-1 text-3xl font-semibold text-green-600">
                    {formatCurrency(statistics.totalIncome)}
                  </dd>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="truncate text-sm font-medium text-gray-500">Total Expenses</dt>
                  <dd className="mt-1 text-3xl font-semibold text-red-600">
                    {formatCurrency(statistics.totalExpenses)}
                  </dd>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="truncate text-sm font-medium text-gray-500">Net Balance</dt>
                  <dd className={`mt-1 text-3xl font-semibold ${statistics.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(statistics.netBalance)}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Recent payments and pending loans */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent payments */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Recent Payments</h3>
                <Link
                  to="/admin/payments"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  View all
                </Link>
              </div>
              <div className="mt-4 -mx-6 -mb-6">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Member
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {recentPayments.length > 0 ? (
                        recentPayments.map((payment) => (
                          <tr key={payment._id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                              <div className="font-medium text-gray-900">
                                {typeof payment.user === 'object' 
                                  ? `${payment.user.firstName} ${payment.user.lastName}`
                                  : 'Member'}
                              </div>
                              <div className="text-gray-500">{payment.description}</div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span
                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                  payment.status === PaymentStatus.APPROVED
                                    ? 'bg-green-100 text-green-800'
                                    : payment.status === PaymentStatus.PENDING
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {payment.status}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {new Date(payment.paymentDate).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 text-center sm:pl-6"
                          >
                            No recent payments
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Pending loan applications */}
            {/* Only show Pending Loan Applications for ADMIN_LEVEL_2 and SUPER_ADMIN */}
            {(user?.role === 'admin_level_2' || user?.role === 'super_admin') && (
              <div className="card overflow-hidden">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Pending Loan Applications</h3>
                  <Link
                    to="/admin/loans"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    View all
                  </Link>
                </div>
                <div className="mt-4 -mx-6 -mb-6">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                          >
                            Member
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Amount
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Purpose
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {pendingLoans.length > 0 ? (
                          pendingLoans.map((loan) => (
                          <tr key={loan._id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                              <div className="font-medium text-gray-900">
                                {typeof loan.user === 'object' 
                                  ? `${loan.user.firstName} ${loan.user.lastName}`
                                  : 'Member'}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {formatCurrency(loan.amount)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {loan.purpose}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {new Date(loan.applicationDate).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 text-center sm:pl-6"
                          >
                            No pending loan applications
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                to="/admin/members/new"
                className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Add Member
              </Link>
              <Link
                to="/admin/dues/new"
                className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Create Due
              </Link>
              <Link
                to="/admin/levies/new"
                className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Create Levy
              </Link>
              <Link
                to="/admin/accounting/new-transaction"
                className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Record Transaction
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;