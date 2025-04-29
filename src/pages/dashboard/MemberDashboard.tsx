import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { get } from '../../services/api';
import { 
  Payment, 
  MemberDue, 
  MemberLevy, 
  Pledge, 
  Donation, 
  Loan,
  PaymentStatus
} from '../../types';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    payments: [] as Payment[],
    dues: [] as MemberDue[],
    levies: [] as MemberLevy[],
    pledges: [] as Pledge[],
    donations: [] as Donation[],
    loans: [] as Loan[],
  });

  // Calculate financial summary
  const calculateSummary = () => {
    // Total payments
    const totalPayments = dashboardData.payments.reduce(
      (sum, payment) => sum + (payment.status === PaymentStatus.APPROVED ? payment.amount : 0),
      0
    );

    // Total due balance
    const totalDueBalance = dashboardData.dues.reduce(
      (sum, due) => sum + due.balance,
      0
    );

    // Total levy balance
    const totalLevyBalance = dashboardData.levies.reduce(
      (sum, levy) => sum + levy.balance,
      0
    );

    // Total pledge balance (unfulfilled pledges)
    const totalPledgeBalance = dashboardData.pledges
      .filter(pledge => pledge.status !== PaymentStatus.APPROVED)
      .reduce((sum, pledge) => sum + pledge.amount, 0);

    // Total loan balance (approved loans that haven't been fully repaid)
    const totalLoanBalance = dashboardData.loans
      .filter(loan => loan.status === 'approved' || loan.status === 'pending')
      .reduce((sum, loan) => sum + loan.amount, 0);

    return {
      totalPayments,
      totalDueBalance,
      totalLevyBalance,
      totalPledgeBalance,
      totalLoanBalance,
      totalOutstanding: totalDueBalance + totalLevyBalance + totalPledgeBalance,
    };
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch payments
        const paymentsResponse = await get<{ payments: Payment[] }>('/payments/my-payments');
        
        // Fetch dues
        const duesResponse = await get<{ memberDues: MemberDue[] }>('/dues/members/my-dues');
        
        // Fetch levies
        const leviesResponse = await get<{ memberLevies: MemberLevy[] }>('/levies/members/my-levies');
        
        // Fetch pledges
        const pledgesResponse = await get<{ pledges: Pledge[] }>('/pledges/my-pledges');
        
        // Fetch donations
        const donationsResponse = await get<{ donations: Donation[] }>('/donations/my-donations');
        
        // Fetch loans
        const loansResponse = await get<{ loans: Loan[] }>('/loans/my-loans');
        
        setDashboardData({
          payments: paymentsResponse.success ? paymentsResponse.data?.payments || [] : [],
          dues: duesResponse.success ? duesResponse.data?.memberDues || [] : [],
          levies: leviesResponse.success ? leviesResponse.data?.memberLevies || [] : [],
          pledges: pledgesResponse.success ? pledgesResponse.data?.pledges || [] : [],
          donations: donationsResponse.success ? donationsResponse.data?.donations || [] : [],
          loans: loansResponse.success ? loansResponse.data?.loans || [] : [],
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const summary = calculateSummary();

  // Format currency to Naira
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  // Recent transactions (payments, both pending and approved)
  const recentTransactions = [...dashboardData.payments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Upcoming dues and levies
  const upcomingObligations = [
    ...dashboardData.dues.map(due => ({
      type: 'Due',
      name: due.due.toString().includes('_id') ? (due.due as any).name : 'Due Payment',
      amount: due.balance,
      status: due.status,
    })),
    ...dashboardData.levies.map(levy => ({
      type: 'Levy',
      name: levy.levy.toString().includes('_id') ? (levy.levy as any).title : 'Levy Payment',
      amount: levy.balance,
      status: levy.status,
    })),
  ]
    .filter(item => item.status !== PaymentStatus.APPROVED)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Member Dashboard</h1>
        <div className="flex space-x-4 items-center">
          <a
            href="/donations/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Make Donation
          </a>
          <p className="text-sm text-gray-500">
            Welcome back, {user?.firstName} {user?.lastName}
          </p>
        </div>
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
        <>
          {/* Financial summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card bg-white">
              <h3 className="text-sm font-medium text-gray-500">Total Payments</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(summary.totalPayments)}
              </p>
            </div>
            <div className="card bg-white">
              <h3 className="text-sm font-medium text-gray-500">Outstanding Dues</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(summary.totalDueBalance)}
              </p>
            </div>
            <div className="card bg-white">
              <h3 className="text-sm font-medium text-gray-500">Outstanding Levies</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(summary.totalLevyBalance)}
              </p>
            </div>
            <div className="card bg-white">
              <h3 className="text-sm font-medium text-gray-500">Total Outstanding</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(summary.totalOutstanding)}
              </p>
            </div>
          </div>

          {/* Recent donations */}
          <div className="card overflow-hidden">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Recent Donations</h3>
              <a href="/donations/new" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                Make a Donation
              </a>
            </div>
            <div className="mt-4 -mx-6 -mb-6">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Purpose
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Amount
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {dashboardData.donations.length > 0 ? (
                      dashboardData.donations.slice(0, 5).map((donation) => (
                        <tr key={donation._id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <div className="font-medium text-gray-900">{donation.purpose}</div>
                            <div className="text-gray-500 truncate max-w-xs">{donation.description || 'No description'}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatCurrency(donation.amount)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Date(donation.donationDate).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span
                              className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                donation.status === PaymentStatus.APPROVED
                                  ? 'bg-green-100 text-green-800'
                                  : donation.status === PaymentStatus.REJECTED
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {donation.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-sm text-gray-500">
                          No donations yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent transactions and upcoming obligations */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent transactions */}
            <div className="card overflow-hidden">
              <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
              <div className="mt-4 -mx-6 -mb-6">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Description
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {recentTransactions.length > 0 ? (
                        recentTransactions.map((transaction) => (
                          <tr key={transaction._id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                              <div className="font-medium text-gray-900">
                                {transaction.description}
                              </div>
                              <div className="text-gray-500">
                                {new Date(transaction.paymentDate).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {formatCurrency(transaction.amount)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span
                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                  transaction.status === PaymentStatus.APPROVED
                                    ? 'bg-green-100 text-green-800'
                                    : transaction.status === PaymentStatus.PENDING
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {transaction.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 text-center sm:pl-6"
                          >
                            No recent transactions
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Upcoming obligations */}
            <div className="card overflow-hidden">
              <h3 className="text-lg font-medium text-gray-900">Upcoming Obligations</h3>
              <div className="mt-4 -mx-6 -mb-6">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Type
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {upcomingObligations.length > 0 ? (
                        upcomingObligations.map((obligation, index) => (
                          <tr key={index}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {obligation.type}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {obligation.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {formatCurrency(obligation.amount)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 text-center sm:pl-6"
                          >
                            No upcoming obligations
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <a
                href="/payments/new"
                className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Make a Payment
              </a>
              <a
                href="/pledges/new"
                className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Make a Pledge
              </a>
              <a
                href="/donations/new"
                className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Make a Donation
              </a>
              <a
                href="/loans/new"
                className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Apply for Loan
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MemberDashboard;
