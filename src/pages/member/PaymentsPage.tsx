import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../services/api';
import { Payment, MemberDue, PaymentStatus } from '../../types';

const PaymentsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [unpaidDues, setUnpaidDues] = useState<MemberDue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch payment history
        const paymentsResponse = await api.get<{ payments: Payment[] }>('/payments/my-payments');
        console.log('Payments response:', paymentsResponse);
        
        // Fetch unpaid dues - corrected endpoint
        const duesResponse = await api.get<{ memberDues: MemberDue[] }>('/dues/members/my-dues');
        console.log('Dues response:', duesResponse);
        
        if (paymentsResponse.success) {
          setPayments(paymentsResponse.data?.payments || []);
        }
        
        if (duesResponse.success) {
          // Filter for unpaid dues (those with balance > 0)
          const unpaid = duesResponse.data?.memberDues?.filter(due => due.balance > 0) || [];
          setUnpaidDues(unpaid);
        }
        
        if (!paymentsResponse.success || !duesResponse.success) {
          setError('Failed to fetch payment data');
        }
      } catch (err) {
        console.error('Error fetching payment data:', err);
        setError('An error occurred while fetching payment data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user?._id]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceipt(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      // Step 1: Create the payment record first
      const paymentData = {
        amount: parseFloat(amount),
        description: description,
        paymentDate: new Date(),
        status: PaymentStatus.PENDING
      };
      
      const paymentResponse = await api.post<{ payment: Payment }>('/payments', paymentData);
      
      if (!paymentResponse.success) {
        throw new Error(paymentResponse.message || 'Failed to create payment');
      }
      
      // Step 2: If receipt file exists, upload it directly to the payment
      if (receipt && paymentResponse.data && paymentResponse.data.payment && paymentResponse.data.payment._id) {
        const paymentId = paymentResponse.data.payment._id;
        const formData = new FormData();
        formData.append('receipt', receipt);
        
        const uploadResponse = await api.patch(`/payments/${paymentId}/receipt`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (!uploadResponse.success) {
          console.warn('Receipt upload failed:', uploadResponse.message);
          // We don't throw here because the payment was already created
        }
      }
      
      setSuccessMessage('Payment submitted successfully!');
      // Reset form
      setAmount('');
      setDescription('');
      setReceipt(null);
      
      // Refresh payment history
      const paymentsResponse = await api.get<{ payments: Payment[] }>('/payments/my-payments');
      if (paymentsResponse.success) {
        setPayments(paymentsResponse.data?.payments || []);
      }
    } catch (err: any) {
      console.error('Error submitting payment:', err);
      setError(err.message || 'An error occurred while submitting payment');
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your payments, upload receipts, and view payment history.
          </p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('upload')}
            className={`${
              activeTab === 'upload'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Upload Receipt
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Payment History
          </button>
          <button
            onClick={() => setActiveTab('dues')}
            className={`${
              activeTab === 'dues'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Unpaid Dues
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md">
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
        ) : (
          <>
            {/* Upload Receipt Form */}
            {activeTab === 'upload' && (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Upload Payment Receipt</h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Upload your payment receipt for verification and processing.</p>
                  </div>
                  
                  {successMessage && (
                    <div className="mt-4 bg-green-50 p-4 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800">{successMessage}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <form className="mt-5 sm:flex sm:items-center" onSubmit={handleSubmit}>
                    <div className="w-full space-y-4">
                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                          Amount
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            name="amount"
                            id="amount"
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="description"
                            id="description"
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Monthly dues payment"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="receipt" className="block text-sm font-medium text-gray-700">
                          Receipt
                        </label>
                        <div className="mt-1">
                          <input
                            type="file"
                            name="receipt"
                            id="receipt"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                            onChange={handleFileChange}
                            accept="image/*,.pdf"
                            required
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          Supported formats: JPG, PNG, PDF. Maximum file size: 5MB.
                        </p>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                          </>
                        ) : (
                          'Upload Receipt'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Payment History */}
            {activeTab === 'history' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {payments.length === 0 ? (
                    <li className="px-4 py-4 sm:px-6">
                      <div className="text-center text-gray-500">
                        No payment history found.
                      </div>
                    </li>
                  ) : (
                    payments.map((payment) => (
                      <li key={payment._id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <p className="text-sm font-medium text-primary-600 truncate">
                              {payment.description}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              {formatDate(payment.paymentDate)}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <p className="text-sm font-semibold text-gray-900">
                              {formatCurrency(payment.amount)}
                            </p>
                            <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(payment.status)}`}>
                              {payment.status}
                            </span>
                          </div>
                        </div>
                        {payment.receiptUrl && (
                          <div className="mt-2">
                            <a
                              href={payment.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary-600 hover:text-primary-900"
                            >
                              View Receipt
                            </a>
                          </div>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
            
            {/* Unpaid Dues */}
            {activeTab === 'dues' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {unpaidDues.length === 0 ? (
                    <li className="px-4 py-4 sm:px-6">
                      <div className="text-center text-gray-500">
                        No unpaid dues found.
                      </div>
                    </li>
                  ) : (
                    unpaidDues.map((memberDue) => (
                      <li key={memberDue._id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <p className="text-sm font-medium text-primary-600 truncate">
                              {typeof memberDue.due === 'string' ? memberDue.due : memberDue.due.name}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Due date: {typeof memberDue.due === 'string' ? 'N/A' : formatDate(memberDue.due.dueDate)}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <p className="text-sm font-semibold text-gray-900">
                              {formatCurrency(memberDue.balance)}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Paid: {formatCurrency(memberDue.amountPaid)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <button
                            className="text-xs text-white bg-primary-600 hover:bg-primary-700 px-2 py-1 rounded"
                            onClick={() => {
                              setActiveTab('upload');
                              setDescription(`Payment for ${typeof memberDue.due === 'string' ? memberDue.due : memberDue.due.name}`);
                              setAmount(memberDue.balance.toString());
                            }}
                          >
                            Pay Now
                          </button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
