import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as api from '../../services/api';
import { Loan, LoanStatus } from '../../types';
import { LoanStatusChart, LoanAmountChart, LoanTrendChart, generateMockLoanData } from '../../components/charts/LoanCharts';
import { useAuth } from '../../context/AuthContext';

const LoansPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  // Check if user has permission to access loans management
  useEffect(() => {
    // Only ADMIN_LEVEL_2 and SUPER_ADMIN can access loans management
    if (user && user.role !== 'admin_level_2' && user.role !== 'super_admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  // Get activeTab from URL query parameter or default to 'all'
  const tabFromUrl = searchParams.get('activeTab');
  
  // State for loans data
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'all');
  
  // State for loan details modal
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Summary statistics
  const [totalActiveLoans, setTotalActiveLoans] = useState(0);
  const [pendingApplications, setPendingApplications] = useState(0);
  const [repaymentRate, setRepaymentRate] = useState(0);
  const [approvedLoans, setApprovedLoans] = useState(0);
  const [rejectedLoans, setRejectedLoans] = useState(0);
  const [defaultedLoans, setDefaultedLoans] = useState(0);

  // Fetch loans data on component mount and when activeTab changes
  useEffect(() => {
    fetchLoans();
  }, [activeTab]);
  
  // Update URL when activeTab changes manually (not from URL)
  useEffect(() => {
    const tabFromUrl = searchParams.get('activeTab');
    if (tabFromUrl !== activeTab && !(tabFromUrl === null && activeTab === 'all')) {
      const newSearchParams = new URLSearchParams(searchParams);
      if (activeTab === 'all') {
        newSearchParams.delete('activeTab');
      } else {
        newSearchParams.set('activeTab', activeTab);
      }
      navigate({ search: newSearchParams.toString() }, { replace: true });
    }
  }, [activeTab, searchParams, navigate]);

  // Function to fetch loans data
  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      let url = '/loans';
      
      if (activeTab !== 'all') {
        url += `/${activeTab}`;
      }
      
      const response = await api.get<{ 
        loans: Loan[],
        totalActiveLoans: number,
        pendingApplications: number,
        repaymentRate: number,
        approvedLoans: number,
        rejectedLoans: number,
        defaultedLoans: number
      }>(url);
      
      if (response.success) {
        setLoans(response.data?.loans || []);
        setTotalActiveLoans(response.data?.totalActiveLoans || 0);
        setPendingApplications(response.data?.pendingApplications || 0);
        setRepaymentRate(response.data?.repaymentRate || 0);
        setApprovedLoans(response.data?.approvedLoans || 0);
        setRejectedLoans(response.data?.rejectedLoans || 0);
        setDefaultedLoans(response.data?.defaultedLoans || 0);
      } else {
        setError(response.message || 'Failed to fetch loans');
      }
    } catch (err) {
      console.error('Error fetching loans:', err);
      setError('An error occurred while fetching loans');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle loan approval
  const handleApproveLoan = async (loanId: string) => {
    try {
      const response = await api.put(`/loans/${loanId}/approve`, {});
      
      if (response.success) {
        // Refresh loans
        fetchLoans();
        setIsModalOpen(false);
      } else {
        setError(response.message || 'Failed to approve loan');
      }
    } catch (err) {
      console.error('Error approving loan:', err);
      setError('An error occurred while approving loan');
    }
  };
  
  // Function to handle loan rejection
  const handleRejectLoan = async (loanId: string) => {
    try {
      const response = await api.put(`/loans/${loanId}/reject`, {
        rejectionReason
      });
      
      if (response.success) {
        // Refresh loans
        fetchLoans();
        setIsModalOpen(false);
        setRejectionReason('');
      } else {
        setError(response.message || 'Failed to reject loan');
      }
    } catch (err) {
      console.error('Error rejecting loan:', err);
      setError('An error occurred while rejecting loan');
    }
  };
  
  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Helper function to get status badge class
  const getStatusBadgeClass = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case LoanStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case LoanStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case LoanStatus.PAID:
        return 'bg-blue-100 text-blue-800';
      case 'DEFAULTED' as LoanStatus:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Loans Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage all loan applications, approve or reject pending applications, and track loan status.
          </p>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Loan Status Distribution</h3>
            <LoanStatusChart data={{
              pending: pendingApplications,
              approved: approvedLoans,
              rejected: rejectedLoans,
              paid: totalActiveLoans - pendingApplications - approvedLoans - rejectedLoans - defaultedLoans,
              defaulted: defaultedLoans
            }} />
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Loan Applications Trend</h3>
            <LoanTrendChart data={generateMockLoanData().trendData} />
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-2">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Monthly Loan Amount Distribution</h3>
            <LoanAmountChart data={generateMockLoanData().monthlyData} />
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Loans</dt>
                  <dd className="text-lg font-semibold text-gray-900">{totalActiveLoans}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-lg font-semibold text-gray-900">{pendingApplications}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                  <dd className="text-lg font-semibold text-gray-900">{approvedLoans}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                  <dd className="text-lg font-semibold text-gray-900">{rejectedLoans}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gray-100 rounded-md p-3">
                <svg className="h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Defaulted</dt>
                  <dd className="text-lg font-semibold text-gray-900">{defaultedLoans}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Repayment Rate</dt>
                  <dd className="text-lg font-semibold text-gray-900">{repaymentRate}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            All Loans
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`${
              activeTab === 'pending'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`${
              activeTab === 'approved'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Approved
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`${
              activeTab === 'rejected'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Rejected
          </button>
          <button
            onClick={() => setActiveTab('defaulted')}
            className={`${
              activeTab === 'defaulted'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Defaulted
          </button>
        </nav>
      </div>
      
      {/* Loans Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              ) : loans.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No loans found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try selecting a different tab or check back later.
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Member
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Amount
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Purpose
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Application Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {loans.map((loan) => (
                      <tr key={loan._id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-700 font-medium">
                                {typeof loan.user === 'string' ? 'U' : 
                                  `${loan.user.firstName.charAt(0)}${loan.user.lastName.charAt(0)}`}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">
                                {typeof loan.user === 'string' ? loan.user : 
                                  `${loan.user.firstName} ${loan.user.lastName}`}
                              </div>
                              <div className="text-gray-500">
                                {typeof loan.user === 'string' ? '' : loan.user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatCurrency(loan.amount)}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {loan.purpose}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatDate(loan.applicationDate)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(loan.status)}`}>
                            {loan.status}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => {
                              setSelectedLoan(loan);
                              setIsModalOpen(true);
                            }}
                            className="text-primary-600 hover:text-primary-900 mr-4"
                          >
                            View Details
                          </button>
                          {loan.status === LoanStatus.PENDING && (
                            <>
                              <button
                                onClick={() => handleApproveLoan(loan._id)}
                                className="text-green-600 hover:text-green-900 mr-4"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedLoan(loan);
                                  setIsModalOpen(true);
                                  setRejectionReason('');
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal for Loan Details or Rejection */}
      {isModalOpen && selectedLoan && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      {selectedLoan.status === LoanStatus.PENDING && rejectionReason !== '' ? 'Reject Loan Application' : 'Loan Details'}
                    </h3>
                    
                    {selectedLoan.status === LoanStatus.PENDING && rejectionReason !== '' ? (
                      <div className="mt-4">
                        <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">
                          Rejection Reason
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="rejectionReason"
                            name="rejectionReason"
                            rows={4}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Member</p>
                            <p className="mt-1 text-sm text-gray-900">
                              {typeof selectedLoan.user === 'string' ? selectedLoan.user : 
                                `${selectedLoan.user.firstName} ${selectedLoan.user.lastName}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Amount</p>
                            <p className="mt-1 text-sm text-gray-900">
                              {formatCurrency(selectedLoan.amount)}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-500">Purpose</p>
                          <p className="mt-1 text-sm text-gray-900">{selectedLoan.purpose}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Application Date</p>
                            <p className="mt-1 text-sm text-gray-900">
                              {formatDate(selectedLoan.applicationDate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Repayment Date</p>
                            <p className="mt-1 text-sm text-gray-900">
                              {selectedLoan.repaymentDate ? formatDate(selectedLoan.repaymentDate) : 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <p className="mt-1">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedLoan.status)}`}>
                                {selectedLoan.status}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Interest Rate</p>
                            <p className="mt-1 text-sm text-gray-900">
                              {selectedLoan.interestRate}%
                            </p>
                          </div>
                        </div>
                        
                        {selectedLoan.rejectionReason && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Rejection Reason</p>
                            <p className="mt-1 text-sm text-red-600">{selectedLoan.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                {selectedLoan.status === LoanStatus.PENDING && rejectionReason !== '' ? (
                  <>
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => handleRejectLoan(selectedLoan._id)}
                    >
                      Reject Loan
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto sm:text-sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Close
                  </button>
                )}
                {selectedLoan.status === LoanStatus.PENDING && rejectionReason === '' && (
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm mr-3"
                    onClick={() => handleApproveLoan(selectedLoan._id)}
                  >
                    Approve Loan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoansPage;
