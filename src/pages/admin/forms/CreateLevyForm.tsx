import { useState, useEffect } from 'react';
import * as api from '../../../services/api';
import { User } from '../../../types';

const CreateLevyForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    description: '',
    startDate: '',
    endDate: '',
    isActive: true,
    assignToAll: true,
    selectedMembers: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Fetch members when component mounts
  useEffect(() => {
    const fetchMembers = async () => {
      setLoadingMembers(true);
      try {
        const response = await api.get<{ members: User[] }>('/users/members');
        if (response.success) {
          setMembers(response.data?.members || []);
        } else {
          setError('Failed to fetch members');
        }
      } catch (err) {
        console.error('Error fetching members:', err);
        setError('An error occurred while fetching members');
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      if (name === 'assignToAll') {
        // If assignToAll is checked, clear selected members
        const isChecked = (e.target as HTMLInputElement).checked;
        setFormData((prev) => ({
          ...prev,
          assignToAll: isChecked,
          selectedMembers: isChecked ? [] : prev.selectedMembers
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMemberSelection = (memberId: string) => {
    setFormData((prev) => {
      const selectedMembers = [...prev.selectedMembers];
      
      if (selectedMembers.includes(memberId)) {
        // Remove member if already selected
        return {
          ...prev,
          selectedMembers: selectedMembers.filter(id => id !== memberId)
        };
      } else {
        // Add member if not already selected
        return {
          ...prev,
          selectedMembers: [...selectedMembers, memberId]
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate that members are selected if not assigning to all
      if (!formData.assignToAll && formData.selectedMembers.length === 0) {
        setError('Please select at least one member or choose to assign to all members');
        setIsLoading(false);
        return;
      }

      // Format data for API
      const levyData = {
        ...formData,
        amount: parseFloat(formData.amount),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      };

      const response = await api.post('/levies', levyData);

      if (response.success) {
        setSuccess('Levy created successfully');
        // Reset form
        setFormData({
          title: '',
          amount: '',
          description: '',
          startDate: '',
          endDate: '',
          isActive: true,
          assignToAll: true,
          selectedMembers: [],
        });
      } else {
        setError(response.message || 'Failed to create levy');
      }
    } catch (err) {
      console.error('Error creating levy:', err);
      setError('An error occurred while creating levy');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Create New Levy</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Create a new levy and assign it to all members or select specific members.</p>
        </div>
        
        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
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
        )}

        {success && (
          <div className="mt-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
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
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₦</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date (Optional)
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <div className="flex items-center h-5">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                If checked, this levy will be immediately visible to assigned members.
              </p>
            </div>

            <div className="sm:col-span-6">
              <div className="flex items-center h-5 mt-4">
                <input
                  id="assignToAll"
                  name="assignToAll"
                  type="checkbox"
                  checked={formData.assignToAll}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="assignToAll" className="ml-2 block text-sm font-medium text-gray-700">
                  Assign to all active members
                </label>
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">Brief description of the levy.</p>
            </div>

            {!formData.assignToAll && (
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Members
                </label>
                {loadingMembers ? (
                  <div className="text-sm text-gray-500">Loading members...</div>
                ) : members.length === 0 ? (
                  <div className="text-sm text-gray-500">No members found</div>
                ) : (
                  <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {members.map((member) => (
                        <div key={member._id} className="flex items-center">
                          <input
                            id={`member-${member._id}`}
                            type="checkbox"
                            checked={formData.selectedMembers.includes(member._id)}
                            onChange={() => handleMemberSelection(member._id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`member-${member._id}`} className="ml-2 block text-sm text-gray-700">
                            {member.firstName} {member.lastName} ({member.membershipId || 'No ID'})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!loadingMembers && members.length > 0 && (
                  <div className="mt-2 text-sm text-gray-500">
                    {formData.selectedMembers.length} member(s) selected
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Levy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLevyForm;
