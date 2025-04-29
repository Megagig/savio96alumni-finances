import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { post, get, patch } from '../../services/api';
import { MemberDue, MemberLevy, PaymentStatus, Payment } from '../../types';

const MakePaymentForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentType, setPaymentType] = useState('general');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Options for payment
  const [dues, setDues] = useState<MemberDue[]>([]);
  const [levies, setLevies] = useState<MemberLevy[]>([]);
  
  // Fetch dues and levies
  useEffect(() => {
    const fetchPaymentOptions = async () => {
      try {
        // Fetch dues
        const duesResponse = await get<{ memberDues: MemberDue[] }>('/dues/members/my-dues');
        if (duesResponse.success) {
          setDues(duesResponse.data?.memberDues || []);
        }
        
        // Fetch levies
        const leviesResponse = await get<{ memberLevies: MemberLevy[] }>('/levies/members/my-levies');
        if (leviesResponse.success) {
          setLevies(leviesResponse.data?.memberLevies || []);
        }
      } catch (err) {
        console.error('Error fetching payment options:', err);
        setError('Failed to load payment options. Please try again.');
      }
    };
    
    fetchPaymentOptions();
  }, []);
  
  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceipt(e.target.files[0]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate form
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      if (!description) {
        throw new Error('Please provide a payment description');
      }
      
      if ((paymentType === 'due' || paymentType === 'levy') && !selectedItemId) {
        throw new Error(`Please select a ${paymentType} to pay for`);
      }
      
      // Step 1: Create payment payload
      const paymentData: any = {
        amount: parseFloat(amount),
        description: description,
        paymentDate: new Date(),
        status: PaymentStatus.PENDING,
      };
      
      // Add related item if applicable
      if (paymentType === 'due') {
        paymentData.dueId = selectedItemId;
      } else if (paymentType === 'levy') {
        paymentData.levyId = selectedItemId;
      }
      
      // Submit payment
      const response = await post<{ payment: Payment }>('/payments', paymentData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to submit payment');
      }
      
      // Step 2: If receipt file exists, upload it directly to the payment
      if (receipt && response.data && response.data.payment && response.data.payment._id) {
        const paymentId = response.data.payment._id;
        const formData = new FormData();
        formData.append('receipt', receipt);
        
        const uploadResponse = await patch(`/payments/${paymentId}/receipt`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (!uploadResponse.success) {
          console.warn('Receipt upload failed:', uploadResponse.message);
          // We don't throw here because the payment was already created
        }
      }
      
      setSuccess('Payment submitted successfully! It will be reviewed by an admin.');
      // Reset form
      setAmount('');
      setDescription('');
      setPaymentType('general');
      setSelectedItemId('');
      setReceipt(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Make a Payment</h1>
        
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
            <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700">
              Payment Type
            </label>
            <select
              id="paymentType"
              value={paymentType}
              onChange={(e) => {
                setPaymentType(e.target.value);
                setSelectedItemId('');
              }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="general">General Payment</option>
              <option value="due">Due Payment</option>
              <option value="levy">Levy Payment</option>
            </select>
          </div>
          
          {paymentType === 'due' && (
            <div>
              <label htmlFor="dueId" className="block text-sm font-medium text-gray-700">
                Select Due
              </label>
              <select
                id="dueId"
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="">Select a due</option>
                {dues.map((due) => (
                  <option key={due._id} value={due._id}>
                    {typeof due.due === 'string' 
                      ? `Due (Balance: ₦${due.balance.toFixed(2)})` 
                      : `${(due.due as any).name} (Balance: ₦${due.balance.toFixed(2)})`}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {paymentType === 'levy' && (
            <div>
              <label htmlFor="levyId" className="block text-sm font-medium text-gray-700">
                Select Levy
              </label>
              <select
                id="levyId"
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="">Select a levy</option>
                {levies.map((levy) => (
                  <option key={levy._id} value={levy._id}>
                    {typeof levy.levy === 'string' 
                      ? `Levy (Balance: ₦${levy.balance.toFixed(2)})` 
                      : `${(levy.levy as any).title} (Balance: ₦${levy.balance.toFixed(2)})`}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount (₦)
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
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Payment for..."
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="receipt" className="block text-sm font-medium text-gray-700">
              Payment Receipt (Optional)
            </label>
            <div className="mt-1">
              <input
                type="file"
                id="receipt"
                name="receipt"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                Upload a receipt image or PDF (max 5MB)
              </p>
              {receipt && (
                <p className="mt-1 text-xs text-green-600">
                  File selected: {receipt.name}
                </p>
              )}
            </div>
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
              {isLoading ? 'Submitting...' : 'Submit Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MakePaymentForm;
