import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { post, get } from '../../services/api';
import { User } from '../../types';

const CreateLevyForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    dueDate: '',
    applyToAllMembers: true,
    selectedMembers: [] as string[],
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await get<{ users: User[] }>('/users?role=member');
        if (response.success) {
          setMembers(response.data?.users || []);
        }
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchMembers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name === 'applyToAllMembers') {
      setFormData(prev => ({ ...prev, applyToAllMembers: checked, selectedMembers: [] }));
    }
  };

  const handleMemberSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({ ...prev, selectedMembers: selectedOptions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Convert amount to number
      const amountNumber = parseFloat(formData.amount);
      if (isNaN(amountNumber)) {
        throw new Error('Amount must be a valid number');
      }

      // Prepare data for API
      const levyData = {
        title: formData.title,
        description: formData.description,
        amount: amountNumber,
        dueDate: formData.dueDate,
        members: formData.applyToAllMembers ? 'all' : formData.selectedMembers,
      };

      const response = await post('/levies', levyData);

      if (response.success) {
        setSuccessMessage('Levy created successfully!');
        // Reset form
        setFormData({
          title: '',
          description: '',
          amount: '',
          dueDate: '',
          applyToAllMembers: true,
          selectedMembers: [],
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      } else {
        setError(response.message || 'Failed to create levy');
      }
    } catch (err: any) {
      console.error('Error creating levy:', err);
      setError(err.message || 'An error occurred while creating the levy');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: string) => {
    if (!amount) return '';
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return amount;
    
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(numAmount);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Create New Levy</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create a new levy for members by filling out the form below.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Levy Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Building Project Levy"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount (₦)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="10000"
                  />
                </div>
                {formData.amount && (
                  <p className="mt-1 text-sm text-gray-500">
                    {formatCurrency(formData.amount)}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    name="description"
                    id="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Special levy for the new building project"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="dueDate"
                    id="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="applyToAllMembers"
                      name="applyToAllMembers"
                      type="checkbox"
                      checked={formData.applyToAllMembers}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="applyToAllMembers" className="font-medium text-gray-700">
                      Apply to all members
                    </label>
                    <p className="text-gray-500">
                      If checked, this levy will be applied to all active members.
                    </p>
                  </div>
                </div>
              </div>

              {!formData.applyToAllMembers && (
                <div className="sm:col-span-2">
                  <label htmlFor="selectedMembers" className="block text-sm font-medium text-gray-700">
                    Select Members
                  </label>
                  <div className="mt-1">
                    <select
                      id="selectedMembers"
                      name="selectedMembers"
                      multiple
                      value={formData.selectedMembers}
                      onChange={handleMemberSelection}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      size={5}
                    >
                      {isLoadingMembers ? (
                        <option disabled>Loading members...</option>
                      ) : (
                        members.map(member => (
                          <option key={member._id} value={member._id}>
                            {member.firstName} {member.lastName} ({member.email})
                          </option>
                        ))
                      )}
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                      Hold Ctrl (or Cmd on Mac) to select multiple members
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-75"
              >
                {isSubmitting ? 'Creating...' : 'Create Levy'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLevyForm;
