import { useState } from 'react';
import { User, Payment, PaymentStatus, PaymentType, MemberDue, MemberLevy, Pledge } from '../../../types';
import * as api from '../../../services/api';

interface PaymentsTabProps {
  member: User;
  payments: Payment[];
  onRefresh: () => void;
}

const PaymentsTab = ({ member, payments, onRefresh }: PaymentsTabProps) => {
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.DUE);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [relatedItemId, setRelatedItemId] = useState('');
  const [relatedItems, setRelatedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const fetchRelatedItems = async (type: PaymentType) => {
    try {
      let endpoint = '';
      switch (type) {
        case PaymentType.DUE:
          endpoint = `/dues/member/${member._id}?status=unpaid`;
          break;
        case PaymentType.LEVY:
          endpoint = `/levies/member/${member._id}?status=unpaid`;
          break;
        case PaymentType.PLEDGE:
          endpoint = `/pledges/user/${member._id}?status=pending`;
          break;
        default:
          setRelatedItems([]);
          // Fetch member dues
          const duesResponse = await api.get<{ memberDues: MemberDue[] }>(`/dues/member/${member._id}`);
          if (duesResponse.success && duesResponse.data) {
            setRelatedItems(duesResponse.data.memberDues || []);
          }
          return;
      }

      const response = await api.get(endpoint);
      if (response.success && response.data) {
        let items: any[] = [];
        if (type === PaymentType.DUE) {
          const duesData = response.data as { memberDues?: MemberDue[] };
          items = duesData.memberDues || [];
        } else if (type === PaymentType.LEVY) {
          const leviesData = response.data as { memberLevies?: MemberLevy[] };
          items = leviesData.memberLevies || [];
        } else if (type === PaymentType.PLEDGE) {
          const pledgesData = response.data as { pledges?: Pledge[] };
          items = pledgesData.pledges || [];
        }
        setRelatedItems(items);
      } else {
        setRelatedItems([]);
      }
    } catch (err) {
      console.error(`Error fetching ${paymentType}:`, err);
      setRelatedItems([]);
    }
  };

  const handlePaymentTypeChange = async (type: PaymentType) => {
    setPaymentType(type);
    setRelatedItemId('');
    
    if (type !== PaymentType.DONATION) {
      await fetchRelatedItems(type);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    if (!amount || (paymentType !== PaymentType.DONATION && !relatedItemId)) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }
    
    try {
      const paymentData = {
        user: member._id,
        amount: parseFloat(amount),
        paymentType,
        relatedItem: relatedItemId || undefined,
        description,
        paymentDate,
        paymentMethod,
        referenceNumber: referenceNumber || undefined,
        paidByAdmin: true
      };
      
      const response = await api.post('/payments/admin-payment', paymentData);
      
      if (response.success) {
        setSuccess('Payment recorded successfully!');
        // Reset form
        setAmount('');
        setDescription('');
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod('cash');
        setReferenceNumber('');
        setRelatedItemId('');
        
        // Close form and refresh data
        setIsAddingPayment(false);
        onRefresh();
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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Payment History</h3>
        <button
          type="button"
          onClick={() => setIsAddingPayment(!isAddingPayment)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {isAddingPayment ? 'Cancel' : 'Add Payment'}
        </button>
      </div>

      {/* Add Payment Form */}
      {isAddingPayment && (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Record Payment for {member.firstName} {member.lastName}</h4>
          
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
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
            <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
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
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            <div>
              <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700">
                Payment Type <span className="text-red-500">*</span>
              </label>
              <select
                id="paymentType"
                name="paymentType"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={paymentType}
                onChange={(e) => handlePaymentTypeChange(e.target.value as PaymentType)}
                required
              >
                <option value={PaymentType.DUE}>Due</option>
                <option value={PaymentType.LEVY}>Levy</option>
                <option value={PaymentType.PLEDGE}>Pledge</option>
                <option value={PaymentType.DONATION}>Donation</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount (₦) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                id="amount"
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            
            {paymentType !== PaymentType.DONATION && (
              <div className="sm:col-span-2">
                <label htmlFor="relatedItem" className="block text-sm font-medium text-gray-700">
                  Related {paymentType.charAt(0).toUpperCase() + paymentType.slice(1)} <span className="text-red-500">*</span>
                </label>
                <select
                  id="relatedItem"
                  name="relatedItem"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={relatedItemId}
                  onChange={(e) => setRelatedItemId(e.target.value)}
                  required
                >
                  <option value="">Select {paymentType}</option>
                  {relatedItems.map((item) => (
                    <option key={item._id} value={item._id}>
                      {paymentType === PaymentType.DUE && `${item.due.name} - ${formatCurrency(item.due.amount)}`}
                      {paymentType === PaymentType.LEVY && `${item.levy.title} - ${formatCurrency(item.levy.amount)}`}
                      {paymentType === PaymentType.PLEDGE && `${item.title} - ${formatCurrency(item.amount)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">
                Payment Date
              </label>
              <input
                type="date"
                name="paymentDate"
                id="paymentDate"
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                Payment Method
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="online">Online Payment</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700">
                Reference Number
              </label>
              <input
                type="text"
                name="referenceNumber"
                id="referenceNumber"
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>
            
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
          <p className="mt-1 text-sm text-gray-500">
            This member has no payment records yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(payment.paymentDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* Display payment type based on related item */}
                    {payment.description?.includes('due') ? 'Due' : 
                     payment.description?.includes('levy') ? 'Levy' : 
                     payment.description?.includes('pledge') ? 'Pledge' : 
                     payment.description?.includes('donation') ? 'Donation' : 
                     payment.description?.includes('loan') ? 'Loan Repayment' : 'Payment'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {payment.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentsTab;
