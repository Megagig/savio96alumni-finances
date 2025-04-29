import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as api from '../../services/api';
import { Payment, PaymentStatus } from '../../types';
import AdminPaymentForm from '../../components/admin/AdminPaymentForm';

const PaymentsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get activeTab from URL query parameter or default to 'all'
  const tabFromUrl = searchParams.get('activeTab');
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalCollected, setTotalCollected] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [completedPayments, setCompletedPayments] = useState(0);
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'all');
  const [showAdminPaymentForm, setShowAdminPaymentForm] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [startDate, endDate, activeTab]);
  
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

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      let url = '/payments';
      
      if (activeTab === 'pending') {
        url += '/pending';
      } else if (activeTab === 'approved') {
        url += '/approved';
      }
      
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
      
      const response = await api.get<{ 
        payments: Payment[], 
        totalCollected: number,
        pendingPayments: number,
        completedPayments: number
      }>(url);
      
      if (response.success) {
        setPayments(response.data?.payments || []);
        setTotalCollected(response.data?.totalCollected || 0);
        setPendingPayments(response.data?.pendingPayments || 0);
        setCompletedPayments(response.data?.completedPayments || 0);
      } else {
        setError(response.message || 'Failed to fetch payments');
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('An error occurred while fetching payments');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApprovePayment = async (paymentId: string) => {
    try {
      const response = await api.put(`/payments/${paymentId}/approve`, {});
      
      if (response.success) {
        // Refresh payments
        fetchPayments();
      } else {
        setError(response.message || 'Failed to approve payment');
      }
    } catch (err) {
      console.error('Error approving payment:', err);
      setError('An error occurred while approving payment');
    }
  };
  
  const handleRejectPayment = async (paymentId: string) => {
    try {
      const response = await api.put(`/payments/${paymentId}/reject`, {});
      
      if (response.success) {
        // Refresh payments
        fetchPayments();
      } else {
        setError(response.message || 'Failed to reject payment');
      }
    } catch (err) {
      console.error('Error rejecting payment:', err);
      setError('An error occurred while rejecting payment');
    }
  };
  
  const exportToExcel = async () => {
    let url = `/payments/export/excel`;
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (activeTab !== 'all') queryParams.append('status', activeTab);
    
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
    
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // Create a hidden form to submit a POST request with the token
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${import.meta.env.VITE_API_URL}${url}`;
    form.target = '_blank';
    
    // Add the token as a hidden field
    const tokenField = document.createElement('input');
    tokenField.type = 'hidden';
    tokenField.name = 'token';
    tokenField.value = token || '';
    form.appendChild(tokenField);
    
    // Append the form to the body, submit it, and remove it
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };
  
  const exportToPDF = async () => {
    let url = `/payments/export/pdf`;
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (activeTab !== 'all') queryParams.append('status', activeTab);
    
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
    
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // Create a hidden form to submit a POST request with the token
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${import.meta.env.VITE_API_URL}${url}`;
    form.target = '_blank';
    
    // Add the token as a hidden field
    const tokenField = document.createElement('input');
    tokenField.type = 'hidden';
    tokenField.name = 'token';
    tokenField.value = token || '';
    form.appendChild(tokenField);
    
    // Append the form to the body, submit it, and remove it
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };
  
  const getStatusBadgeClass = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case PaymentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case PaymentStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Payments Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage all payments, approve or reject pending payments, and export payment data.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowAdminPaymentForm(!showAdminPaymentForm)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
            >
              {showAdminPaymentForm ? 'Hide Payment Form' : 'Record Member Payment'}
            </button>
            <button
              type="button"
              onClick={exportToExcel}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
            >
              Export to Excel
            </button>
            <button
              type="button"
              onClick={exportToPDF}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
            >
              Export to PDF
            </button>
          </div>
        </div>
      </div>
      
      {/* Admin Payment Form */}
      {showAdminPaymentForm && (
        <div className="mt-6">
          <AdminPaymentForm onSuccess={() => {
            setShowAdminPaymentForm(false);
            fetchPayments();
          }} />
        </div>
      )}
      
      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Collected</dt>
                  <dd className="text-lg font-semibold text-gray-900">{formatCurrency(totalCollected)}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Payments</dt>
                  <dd className="text-lg font-semibold text-gray-900">{pendingPayments}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed Payments</dt>
                  <dd className="text-lg font-semibold text-gray-900">{completedPayments}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-4 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Filter Payments</h3>
            <p className="mt-1 text-sm text-gray-500">
              Filter payments by date range and status.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-3">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                >
                  <option value="all">All Payments</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payments Table */}
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
              ) : payments.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your filters or check back later.
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
                        Description
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Date
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
                    {payments.map((payment) => (
                      <tr key={payment._id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-700 font-medium">
                                {typeof payment.user === 'string' ? 'U' : 
                                  `${payment.user.firstName.charAt(0)}${payment.user.lastName.charAt(0)}`}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">
                                {typeof payment.user === 'string' ? payment.user : 
                                  `${payment.user.firstName} ${payment.user.lastName}`}
                              </div>
                              <div className="text-gray-500">
                                {typeof payment.user === 'string' ? '' : payment.user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {payment.description}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatDate(payment.paymentDate)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {payment.status === PaymentStatus.PENDING && (
                            <>
                              <button
                                onClick={() => handleApprovePayment(payment._id)}
                                className="text-green-600 hover:text-green-900 mr-4"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectPayment(payment._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {payment.receiptUrl && (
                            <a
                              href={payment.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-900 ml-4"
                            >
                              View Receipt
                            </a>
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
    </div>
  );
};

export default PaymentsPage;
