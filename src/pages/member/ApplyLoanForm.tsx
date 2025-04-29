import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../../services/api';
import { LoanStatus } from '../../types';

const ApplyLoanForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [durationInMonths, setDurationInMonths] = useState('3');
  
  // Predefined loan purposes
  const loanPurposes = [
    'Personal Needs',
    'Business Investment',
    'Education',
    'Medical Expenses',
    'Home Improvement',
    'Debt Consolidation',
    'Other'
  ];
  
  // Loan duration options
  const durationOptions = [
    { value: '3', label: '3 months' },
    { value: '6', label: '6 months' },
    { value: '12', label: '1 year' },
    { value: '24', label: '2 years' },
    { value: '36', label: '3 years' }
  ];
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate form
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Please enter a valid loan amount');
      }
      
      if (!purpose) {
        throw new Error('Please select a loan purpose');
      }
      
      if (!durationInMonths) {
        throw new Error('Please select a loan duration');
      }
      
      // Create loan application payload
      const loanData = {
        amount: parseFloat(amount),
        purpose,
        durationInMonths: parseInt(durationInMonths),
        applicationDate: new Date(),
        status: LoanStatus.PENDING,
        // Default interest rate set by the system
        interestRate: 5
      };
      
      // Submit loan application
      const response = await post('/loans', loanData);
      
      if (response.success) {
        setSuccess('Loan application submitted successfully! It will be reviewed by an admin.');
        // Reset form
        setAmount('');
        setPurpose('');
        setDurationInMonths('3');
        
        // Redirect after short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setError(response.message || 'Failed to submit loan application. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Apply for Loan</h1>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 rounded-md p-4">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Loan Amount (₦)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₦</span>
              </div>
              <input
                type="number"
                name="amount"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              The maximum loan amount is subject to approval based on your membership status.
            </p>
          </div>
          
          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
              Loan Purpose
            </label>
            <select
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              required
            >
              <option value="">Select a purpose</option>
              {loanPurposes.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="durationInMonths" className="block text-sm font-medium text-gray-700">
              Loan Duration
            </label>
            <select
              id="durationInMonths"
              value={durationInMonths}
              onChange={(e) => setDurationInMonths(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              required
            >
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-700">Loan Terms</h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-1">
              <li>• Interest Rate: 5% per annum</li>
              <li>• Processing Time: 2-3 business days</li>
              <li>• Approval is subject to membership status and committee review</li>
              <li>• Early repayment is allowed without penalties</li>
            </ul>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mr-4 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isLoading ? 'Submitting...' : 'Apply for Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLoanForm;
