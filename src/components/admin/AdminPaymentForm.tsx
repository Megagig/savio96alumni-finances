import { useState, useEffect } from 'react';
import { post, get } from '../../services/api';
import { User, PaymentType } from '../../types';

interface AdminPaymentFormProps {
  onSuccess: () => void;
}

const AdminPaymentForm = ({ onSuccess }: AdminPaymentFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType | ''>('');
  const [relatedItemId, setRelatedItemId] = useState('');
  const [description, setDescription] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  
  // Data for dropdowns
  const [users, setUsers] = useState<User[]>([]);
  const [dues, setDues] = useState<any[]>([]);
  const [levies, setLevies] = useState<any[]>([]);
  const [pledges, setPledges] = useState<any[]>([]);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);
  
  useEffect(() => {
    fetchUsers();
    fetchDues();
    fetchLevies();
    fetchPledges();
  }, []);
  
  useEffect(() => {
    // Update related items based on payment type
    if (paymentType === PaymentType.DUE) {
      setRelatedItems(dues);
    } else if (paymentType === PaymentType.LEVY) {
      setRelatedItems(levies);
    } else if (paymentType === PaymentType.PLEDGE) {
      setRelatedItems(pledges);
    } else {
      setRelatedItems([]);
    }
    
    // Reset related item selection
    setRelatedItemId('');
  }, [paymentType, dues, levies, pledges]);
  
  const fetchUsers = async () => {
    try {
      const response = await get<{ users: User[] }>('/users');
      if (response.success) {
        setUsers(response.data?.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };
  
  const fetchDues = async () => {
    try {
      const response = await get<{ dues: any[] }>('/dues');
      if (response.success) {
        setDues(response.data?.dues || []);
      }
    } catch (err) {
      console.error('Error fetching dues:', err);
    }
  };
  
  const fetchLevies = async () => {
    try {
      const response = await get<{ levies: any[] }>('/levies');
      if (response.success) {
        setLevies(response.data?.levies || []);
      }
    } catch (err) {
      console.error('Error fetching levies:', err);
    }
  };
  
  const fetchPledges = async () => {
    try {
      const response = await get<{ pledges: any[] }>('/pledges');
      if (response.success) {
        setPledges(response.data?.pledges || []);
      }
    } catch (err) {
      console.error('Error fetching pledges:', err);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    if (!userId || !amount || !paymentType || (paymentType !== PaymentType.DONATION && !relatedItemId)) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }
    
    try {
      const paymentData = {
        user: userId,
        amount: parseFloat(amount),
        paymentType,
        relatedItem: relatedItemId || undefined,
        description,
        paymentDate,
        paymentMethod,
        referenceNumber: referenceNumber || undefined,
        paidByAdmin: true
      };
      
      const response = await post('/payments/admin-payment', paymentData);
      
      if (response.success) {
        setSuccess('Payment recorded successfully!');
        // Reset form
        setUserId('');
        setAmount('');
        setPaymentType('');
        setRelatedItemId('');
        setDescription('');
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod('cash');
        setReferenceNumber('');
        
        // Notify parent component
        onSuccess();
      } else {
        setError(response.message || 'Failed to record payment');
      }
    } catch (err: any) {
      console.error('Error recording payment:', err);
      setError(err.message || 'An error occurred while recording payment');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Record Payment for Member</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Use this form to record payments made by members that haven't been updated in the system.</p>
        </div>
        
        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-5 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Member Selection */}
            <div className="sm:col-span-3">
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                Member <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="userId"
                  name="userId"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                >
                  <option value="">Select Member</option>
                  {users
                    .filter(user => user.role === 'member')
                    .map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            
            {/* Payment Type */}
            <div className="sm:col-span-3">
              <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700">
                Payment Type <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="paymentType"
                  name="paymentType"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                  required
                >
                  <option value="">Select Payment Type</option>
                  <option value={PaymentType.DUE}>Due</option>
                  <option value={PaymentType.LEVY}>Levy</option>
                  <option value={PaymentType.PLEDGE}>Pledge</option>
                  <option value={PaymentType.DONATION}>Donation</option>
                </select>
              </div>
            </div>
            
            {/* Related Item (for dues, levies, pledges) */}
            {paymentType && paymentType !== PaymentType.DONATION && (
              <div className="sm:col-span-3">
                <label htmlFor="relatedItemId" className="block text-sm font-medium text-gray-700">
                  {paymentType === PaymentType.DUE ? 'Due' : paymentType === PaymentType.LEVY ? 'Levy' : 'Pledge'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="relatedItemId"
                    name="relatedItemId"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={relatedItemId}
                    onChange={(e) => setRelatedItemId(e.target.value)}
                    required
                  >
                    <option value="">Select {paymentType === PaymentType.DUE ? 'Due' : paymentType === PaymentType.LEVY ? 'Levy' : 'Pledge'}</option>
                    {relatedItems.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.title || item.name} ({new Date(item.dueDate || item.deadline || item.pledgeDate).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            {/* Amount */}
            <div className="sm:col-span-3">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount (₦) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  min="0"
                  step="0.01"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {/* Payment Date */}
            <div className="sm:col-span-3">
              <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="paymentDate"
                  id="paymentDate"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {/* Payment Method */}
            <div className="sm:col-span-3">
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            {/* Reference Number (optional) */}
            <div className="sm:col-span-3">
              <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700">
                Reference Number
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="referenceNumber"
                  id="referenceNumber"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
              </div>
            </div>
            
            {/* Description */}
            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Brief description of the payment (optional)
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Record Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPaymentForm;
