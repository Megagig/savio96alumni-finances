import { useState, useEffect } from 'react';
import * as api from '../../../services/api';
import { User, UserRole } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

// Helper function to get a readable role name
const getRoleName = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN_LEVEL_1:
      return 'Admin Level 1';
    case UserRole.ADMIN_LEVEL_2:
      return 'Admin Level 2';
    case UserRole.SUPER_ADMIN:
      return 'Super Admin';
    case UserRole.ADMIN:
      return 'Admin';
    default:
      return 'Member';
  }
};

const PromoteMemberForm = () => {
  const { user } = useAuth();
  // Only Super Admins should be able to access this form
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const [members, setMembers] = useState<User[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedRole, setSelectedRole] = useState(UserRole.ADMIN_LEVEL_1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setIsFetching(true);
    try {
      console.log('Fetching members...');
      const response = await api.get<{ members: User[], pagination: any }>('/users/members');
      console.log('Members response:', response);
      
      if (response.success) {
        // The backend returns { members } instead of { users }
        console.log('Successfully fetched members:', response.data?.members);
        
        // Filter out members who are already admins or super admins
        const filteredMembers = (response.data?.members || []).filter(member => 
          member.role === UserRole.MEMBER || 
          member.role === UserRole.ADMIN_LEVEL_1 || 
          member.role === UserRole.ADMIN_LEVEL_2
        );
        
        setMembers(filteredMembers);
      } else {
        console.error('Failed to fetch members:', response.message);
        setError(response.message || 'Failed to fetch members');
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('An error occurred while fetching members');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      setError('Please select a member');
      return;
    }

    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log(`Promoting user ${selectedMemberId} to role: ${selectedRole}`);
      
      // Use the selected role for the payload
      const payload = { role: selectedRole };
      console.log('Request payload:', payload);
      
      // Make the API call to update the user's role
      const response = await api.patch<{ user: User }>(`/users/${selectedMemberId}/role`, payload);
      console.log('Promotion response:', response);

      if (response.success) {
        setSuccess(`Member promoted to ${getRoleName(selectedRole)} successfully`);
        setSelectedMemberId('');
        // Refresh the member list
        fetchMembers();
      } else {
        // Handle API error response
        console.error('Failed to promote member:', response);
        setError(response.message || 'Failed to promote member');
      }
    } catch (err: any) {
      console.error('Error promoting member:', err);
      
      // Log detailed error information
      if (err.response) {
        console.error('Error response:', err.response);
        console.error('Error response data:', err.response.data);
      }
      
      // Provide more detailed error message if available
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'An error occurred while promoting member';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // If not a super admin, show access denied message
  if (!isSuperAdmin) {
    return (
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-yellow-800">Access Denied: Only Super Admins can promote members to admin roles.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
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
        <div className="rounded-md bg-green-50 p-4">
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

      <div>
        <label htmlFor="memberId" className="block text-sm font-medium text-gray-700">
          Select Member
        </label>
        <div className="mt-1">
          <select
            id="memberId"
            name="memberId"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            disabled={isFetching}
          >
            <option value="">Select a member</option>
            {members.map((member) => (
              <option key={member._id} value={member._id}>
                {member.firstName} {member.lastName} ({member.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Select Role
        </label>
        <div className="mt-1">
          <select
            id="role"
            name="role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            disabled={isLoading}
          >
            <option value={UserRole.ADMIN_LEVEL_1}>Admin Level 1</option>
            <option value={UserRole.ADMIN_LEVEL_2}>Admin Level 2</option>
            <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
          </select>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading || isFetching || !selectedMemberId}
          className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Promoting...' : `Promote to ${getRoleName(selectedRole)}`}
        </button>
      </div>
    </form>
  );
};

export default PromoteMemberForm;
