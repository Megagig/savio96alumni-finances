import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as api from '../../services/api';
import { Transaction, TransactionType } from '../../types';
import { format, subDays, subMonths, subYears, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';

const AccountingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get view from URL query parameter or default to 'all'
  const viewFromUrl = searchParams.get('view');
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Handle the special case for expenses/expense mismatch
  const initialTab = viewFromUrl === 'expenses' ? 'expense' : (viewFromUrl || 'all');
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Date range filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dateFilterType, setDateFilterType] = useState<string>('all');
  
  // Summary statistics
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netIncome, setNetIncome] = useState(0);

  useEffect(() => {
    fetchTransactions();
  }, [activeTab, startDate, endDate]);
  
  // Update URL when activeTab changes manually (not from URL)
  useEffect(() => {
    const viewFromUrl = searchParams.get('view');
    
    // Handle special case for expenses/expense mismatch
    if (viewFromUrl === 'expenses' && activeTab !== 'expenses') {
      setActiveTab('expense');
      return;
    }
    
    if (viewFromUrl !== activeTab && !(viewFromUrl === null && activeTab === 'all')) {
      const newSearchParams = new URLSearchParams(searchParams);
      if (activeTab === 'all') {
        newSearchParams.delete('view');
      } else {
        newSearchParams.set('view', activeTab);
      }
      navigate({ search: newSearchParams.toString() }, { replace: true });
    }
  }, [activeTab, searchParams, navigate]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      let url = '/transactions';
      
      if (activeTab !== 'all') {
        url += `/${activeTab}`;
      }
      
      // Add date range parameters if set
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const queryParams = new URLSearchParams(params).toString();
      if (queryParams) {
        url += `?${queryParams}`;
      }
      
      const response = await api.get<{ 
        transactions: Transaction[],
        summary: {
          totalIncome: number,
          totalExpenses: number,
          netIncome: number
        }
      }>(url);
      
      if (response.success) {
        setTransactions(response.data?.transactions || []);
        setTotalRevenue(response.data?.summary?.totalIncome || 0);
        setTotalExpenses(response.data?.summary?.totalExpenses || 0);
        setNetIncome(response.data?.summary?.netIncome || 0);
      } else {
        setError(response.message || 'Failed to fetch transactions');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('An error occurred while fetching transactions');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Apply date filter based on selected period
  const applyDateFilter = (filterType: string) => {
    setDateFilterType(filterType);
    const today = new Date();
    
    switch (filterType) {
      case 'today':
        setStartDate(format(today, 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
      case 'yesterday':
        const yesterday = subDays(today, 1);
        setStartDate(format(yesterday, 'yyyy-MM-dd'));
        setEndDate(format(yesterday, 'yyyy-MM-dd'));
        break;
      case 'thisWeek':
        setStartDate(format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
        setEndDate(format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
        break;
      case 'lastWeek':
        const lastWeekStart = subDays(startOfWeek(today, { weekStartsOn: 1 }), 7);
        const lastWeekEnd = subDays(endOfWeek(today, { weekStartsOn: 1 }), 7);
        setStartDate(format(lastWeekStart, 'yyyy-MM-dd'));
        setEndDate(format(lastWeekEnd, 'yyyy-MM-dd'));
        break;
      case 'thisMonth':
        setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'));
        break;
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        setStartDate(format(startOfMonth(lastMonth), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(lastMonth), 'yyyy-MM-dd'));
        break;
      case 'thisQuarter':
        setStartDate(format(startOfQuarter(today), 'yyyy-MM-dd'));
        setEndDate(format(endOfQuarter(today), 'yyyy-MM-dd'));
        break;
      case 'lastQuarter':
        const lastQuarter = subMonths(today, 3);
        setStartDate(format(startOfQuarter(lastQuarter), 'yyyy-MM-dd'));
        setEndDate(format(endOfQuarter(lastQuarter), 'yyyy-MM-dd'));
        break;
      case 'thisYear':
        setStartDate(format(startOfYear(today), 'yyyy-MM-dd'));
        setEndDate(format(endOfYear(today), 'yyyy-MM-dd'));
        break;
      case 'lastYear':
        const lastYear = subYears(today, 1);
        setStartDate(format(startOfYear(lastYear), 'yyyy-MM-dd'));
        setEndDate(format(endOfYear(lastYear), 'yyyy-MM-dd'));
        break;
      case 'all':
      default:
        setStartDate('');
        setEndDate('');
        break;
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
  
  const getTransactionTypeClass = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INCOME:
        return 'text-green-600';
      case TransactionType.EXPENSE:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const downloadWithAuth = async (url: string, filename: string) => {
    try {
      setIsLoading(true);
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      // Create a fetch request with the Authorization header
      const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download file');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      
      // Click the link to download the file
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      console.error('Error downloading file:', err);
      setError(err.message || 'An error occurred while downloading the file');
    } finally {
      setIsLoading(false);
    }
  };
  
  const exportToExcel = () => {
    let url = `/transactions/export/excel`;
    const params: Record<string, string> = {};
    
    if (activeTab !== 'all') {
      params.type = activeTab;
    }
    
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const queryParams = new URLSearchParams(params).toString();
    if (queryParams) {
      url += `?${queryParams}`;
    }
    
    const filename = `transactions-${new Date().toISOString().split('T')[0]}.xlsx`;
    downloadWithAuth(url, filename);
  };
  
  const exportToPDF = () => {
    let url = `/transactions/export/pdf`;
    const params: Record<string, string> = {};
    
    if (activeTab !== 'all') {
      params.type = activeTab;
    }
    
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const queryParams = new URLSearchParams(params).toString();
    if (queryParams) {
      url += `?${queryParams}`;
    }
    
    const filename = `transactions-${new Date().toISOString().split('T')[0]}.pdf`;
    downloadWithAuth(url, filename);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Accounting</h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-700">
            View and manage all financial transactions, income, and expenses.
          </p>
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-4 md:ml-6 lg:ml-16 flex-none">
          <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-2 sm:space-x-3">
            <button
              type="button"
              onClick={exportToExcel}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 w-full xs:w-auto"
            >
              <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden xs:inline">Excel</span>
            </button>
            <button
              type="button"
              onClick={exportToPDF}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 w-full xs:w-auto"
            >
              <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="hidden xs:inline">PDF</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Date Range Filters */}
      <div className="mt-4 sm:mt-6 bg-white shadow rounded-lg p-3 sm:p-4">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Date Range Filters</h2>
        
        {/* Filter Controls */}
        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          {/* Period Dropdown */}
          <div>
            <label htmlFor="dateFilterType" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Period
            </label>
            <select
              id="dateFilterType"
              value={dateFilterType}
              onChange={(e) => applyDateFilter(e.target.value)}
              className="mt-1 block w-full pl-2 sm:pl-3 pr-8 sm:pr-10 py-1.5 sm:py-2 text-xs sm:text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="thisWeek">This Week</option>
              <option value="lastWeek">Last Week</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisQuarter">This Quarter</option>
              <option value="lastQuarter">Last Quarter</option>
              <option value="thisYear">This Year</option>
              <option value="lastYear">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDateFilterType('custom');
              }}
              className="mt-1 block w-full pl-2 sm:pl-3 pr-2 sm:pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            />
          </div>
          
          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDateFilterType('custom');
              }}
              className="mt-1 block w-full pl-2 sm:pl-3 pr-2 sm:pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            />
          </div>
          
          {/* Reset Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => applyDateFilter('all')}
              className="w-full sm:w-auto inline-flex justify-center items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Reset Filters
            </button>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
          {/* Income Card */}
          <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
            <h3 className="text-xs sm:text-sm font-medium text-green-800">Total Income</h3>
            <p className="mt-1 sm:mt-2 text-xl sm:text-2xl md:text-3xl font-bold text-green-600 truncate">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          
          {/* Expenses Card */}
          <div className="bg-red-50 rounded-lg p-3 sm:p-4 border border-red-200">
            <h3 className="text-xs sm:text-sm font-medium text-red-800">Total Expenses</h3>
            <p className="mt-1 sm:mt-2 text-xl sm:text-2xl md:text-3xl font-bold text-red-600 truncate">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
          
          {/* Net Income Card */}
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
            <h3 className="text-xs sm:text-sm font-medium text-blue-800">Net Income</h3>
            <p className={`mt-1 sm:mt-2 text-xl sm:text-2xl md:text-3xl font-bold truncate ${netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(netIncome)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Transaction Tabs */}
      <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto p-2 sm:p-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-medium rounded-md ${activeTab === 'all' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            >
              All Transactions
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-medium rounded-md ${activeTab === 'income' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            >
              Income
            </button>
            <button
              onClick={() => setActiveTab('expense')}
              className={`whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-medium rounded-md ${activeTab === 'expense' ? 'bg-red-100 text-red-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab('balance')}
              className={`whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-medium rounded-md ${activeTab === 'balance' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            >
              Net Balance
            </button>
          </nav>
        </div>
      </div>
      
      <div className="mt-4 sm:mt-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold leading-7 text-gray-900 sm:truncate">Transactions</h2>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 bg-white shadow overflow-hidden rounded-lg">
          <div className="px-3 py-4 sm:px-4 sm:py-5">
            {isLoading ? (
              <div className="flex justify-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary-500"></div>
              </div>
            ) : error ? (
              <div className="rounded-md bg-red-50 p-3 sm:p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs sm:text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <svg className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-2 text-xs sm:text-sm font-medium text-gray-900">No transactions found</h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  Try selecting a different tab or check back later.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-3 sm:-mx-4">
                {/* Desktop View */}
                <table className="hidden sm:table min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-gray-900 sm:pl-6">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-900">
                        Description
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-900">
                        Category
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-900">
                        Type
                      </th>
                      <th scope="col" className="px-3 py-3 text-right text-xs font-semibold text-gray-900">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {transactions.map((transaction) => (
                      <tr key={transaction._id}>
                        <td className="whitespace-nowrap py-3 pl-4 pr-3 text-xs font-medium text-gray-900 sm:pl-6">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-500">
                          {transaction.description}
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-500">
                          {transaction.category}
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-500">
                          <span className={getTransactionTypeClass(transaction.type)}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className={`px-3 py-3 text-xs font-medium text-right ${getTransactionTypeClass(transaction.type)}`}>
                          {transaction.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Mobile View - Card Layout */}
                <div className="sm:hidden">
                  <div className="space-y-3 px-3 py-2">
                    {transactions.map((transaction) => (
                      <div key={transaction._id} className="bg-white border rounded-lg shadow-sm p-3">
                        <div className="flex justify-between items-start">
                          <div className="text-xs font-medium text-gray-900">
                            {formatDate(transaction.date)}
                          </div>
                          <div className={`text-xs font-medium ${getTransactionTypeClass(transaction.type)}`}>
                            {transaction.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(transaction.amount)}
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="text-xs text-gray-900 font-medium">{transaction.description}</div>
                          <div className="mt-1 flex justify-between">
                            <div className="text-xs text-gray-500">{transaction.category}</div>
                            <div className="text-xs text-gray-500">
                              <span className={`px-2 py-1 rounded-full text-xs ${transaction.type === TransactionType.INCOME ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {transaction.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingPage;
