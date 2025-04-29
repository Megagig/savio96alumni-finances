import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDonation } from '../../services/donation.service';
import { PaymentStatus } from '../../types';

const MakeDonationForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [description, setDescription] = useState('');
  
  // Predefined donation purposes
  const donationPurposes = [
    'General Fund',
    'Building Project',
    'Charity Work',
    'Community Outreach',
    'Education Fund',
    'Other'
  ];
  
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
      
      if (!purpose) {
        throw new Error('Please select a donation purpose');
      }
      
      // Create donation payload
      const donationData = {
        amount: parseFloat(amount),
        purpose,
        description,
        donationDate: new Date().toISOString(), // Convert to ISO string for API
        status: PaymentStatus.PENDING
      };
      
      // Submit donation
      const response = await createDonation(donationData);
      
      if (response.success) {
        setSuccess('Donation submitted successfully! Thank you for your generosity.');
        // Reset form
        setAmount('');
        setPurpose('');
        setDescription('');
        
        // Redirect after short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setError(response.message || 'Failed to submit donation. Please try again.');
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
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Make a Donation</h1>
        
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
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
              Donation Purpose
            </label>
            <select
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              required
            >
              <option value="">Select a purpose</option>
              {donationPurposes.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          
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
              Additional Notes
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Any additional details about your donation..."
              />
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
              {isLoading ? 'Submitting...' : 'Submit Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MakeDonationForm;
