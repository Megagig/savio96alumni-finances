import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../services/api';
import { Loan, LoanStatus } from '../../types';

const LoansPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('apply');
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [loanHistory, setLoanHistory] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [repaymentDate, setRepaymentDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all loans first
        const loansResponse = await api.get<{ loans: Loan[] }>('/loans/my-loans');
        
        if (loansResponse.success) {
          // Split loans into active and history based on status
          const active = loansResponse.data?.loans?.filter(loan => 
            loan.status === LoanStatus.PENDING || loan.status === LoanStatus.APPROVED
          ) || [];
          
          const history = loansResponse.data?.loans?.filter(loan => 
            loan.status === LoanStatus.PAID || loan.status === LoanStatus.REJECTED
          ) || [];
          
          setActiveLoans(active);
          setLoanHistory(history);
        } else {
          setError('Failed to fetch loan data');
        }
      } catch (err) {
        console.error('Error fetching loan data:', err);
        setError('An error occurred while fetching loan data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user?._id]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      const loanData = {
        amount: parseFloat(amount),
        purpose,
        repaymentDate,
      };
      
      const response = await api.post('/loans/apply', loanData);
      
      if (response.success) {
        setSuccessMessage('Loan application submitted successfully!');
        // Reset form
        setAmount('');
        setPurpose('');
        setRepaymentDate('');
        
        // Refresh loan data
        const activeLoansResponse = await api.get<{ loans: Loan[] }>('/loans/active');
        if (activeLoansResponse.success) {
          setActiveLoans(activeLoansResponse.data?.loans || []);
        }
      } else {
        setError(response.message || 'Failed to submit loan application');
      }
    } catch (err: any) {
      console.error('Error submitting loan application:', err);
      setError(err.message || 'An error occurred while submitting loan application');
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Loans</h1>
          <p className="mt-2 text-sm text-gray-700">
            Apply for loans, view active loans, and check loan history.
          </p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('apply')}
            className={`${
              activeTab === 'apply'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Apply for Loan
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`${
              activeTab === 'active'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Active Loans
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Loan History
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
            {/* Apply for Loan Form */}
            {activeTab === 'apply' && (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Apply for a Loan</h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Fill out the form below to apply for a loan. Your application will be reviewed by an administrator.</p>
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
                          Loan Amount
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
                        <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                          Purpose
                        </label>
                        <div className="mt-1">
                          <textarea
                            name="purpose"
                            id="purpose"
                            rows={3}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Describe the purpose of this loan"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="repaymentDate" className="block text-sm font-medium text-gray-700">
                          Proposed Repayment Date
                        </label>
                        <div className="mt-1">
                          <input
                            type="date"
                            name="repaymentDate"
                            id="repaymentDate"
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={repaymentDate}
                            onChange={(e) => setRepaymentDate(e.target.value)}
                            required
                          />
                        </div>
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
                            Submitting...
                          </>
                        ) : (
                          'Submit Application'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Active Loans */}
            {activeTab === 'active' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {activeLoans.length === 0 ? (
                    <li className="px-4 py-4 sm:px-6">
                      <div className="text-center text-gray-500">
                        No active loans found.
                      </div>
                    </li>
                  ) : (
                    activeLoans.map((loan) => (
                      <li key={loan._id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <p className="text-sm font-medium text-primary-600 truncate">
                              {loan.purpose}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Applied on: {formatDate(loan.applicationDate)}
                            </p>
                            {loan.repaymentDate && (
                              <p className="mt-1 text-sm text-gray-500">
                                Repayment due: {formatDate(loan.repaymentDate)}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end">
                            <p className="text-sm font-semibold text-gray-900">
                              {formatCurrency(loan.amount)}
                            </p>
                            <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(loan.status)}`}>
                              {loan.status}
                            </span>
                            {loan.status === LoanStatus.APPROVED && (
                              <button
                                className="mt-2 text-xs text-white bg-primary-600 hover:bg-primary-700 px-2 py-1 rounded"
                                onClick={() => {
                                  // Navigate to payments page to upload repayment receipt
                                  window.location.href = '/payments';
                                }}
                              >
                                Make Payment
                              </button>
                            )}
                          </div>
                        </div>
                        {loan.rejectionReason && (
                          <div className="mt-2 text-sm text-red-600">
                            <p>Reason for rejection: {loan.rejectionReason}</p>
                          </div>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
            
            {/* Loan History */}
            {activeTab === 'history' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {loanHistory.length === 0 ? (
                    <li className="px-4 py-4 sm:px-6">
                      <div className="text-center text-gray-500">
                        No loan history found.
                      </div>
                    </li>
                  ) : (
                    loanHistory.map((loan) => (
                      <li key={loan._id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <p className="text-sm font-medium text-primary-600 truncate">
                              {loan.purpose}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Applied on: {formatDate(loan.applicationDate)}
                            </p>
                            {loan.approvalDate && (
                              <p className="mt-1 text-sm text-gray-500">
                                Approved on: {formatDate(loan.approvalDate)}
                              </p>
                            )}
                            {loan.repaymentDate && (
                              <p className="mt-1 text-sm text-gray-500">
                                Repayment date: {formatDate(loan.repaymentDate)}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end">
                            <p className="text-sm font-semibold text-gray-900">
                              {formatCurrency(loan.amount)}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Interest rate: {loan.interestRate}%
                            </p>
                            <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(loan.status)}`}>
                              {loan.status}
                            </span>
                          </div>
                        </div>
                        {loan.rejectionReason && (
                          <div className="mt-2 text-sm text-red-600">
                            <p>Reason for rejection: {loan.rejectionReason}</p>
                          </div>
                        )}
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

export default LoansPage;
