import { User } from '../../../types';

interface ProfileTabProps {
  member: User;
}

const ProfileTab = ({ member }: ProfileTabProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
        <div className="col-span-2 mb-4">
          <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
          <p className="mt-1 text-sm text-gray-500">Member's personal and contact details.</p>
        </div>

        <div>
          <dt className="text-sm font-medium text-gray-500">Full name</dt>
          <dd className="mt-1 text-sm text-gray-900">{member.firstName} {member.lastName}</dd>
        </div>
        
        <div>
          <dt className="text-sm font-medium text-gray-500">Membership ID</dt>
          <dd className="mt-1 text-sm text-gray-900">{member.membershipId || 'Not assigned'}</dd>
        </div>
        
        <div>
          <dt className="text-sm font-medium text-gray-500">Email address</dt>
          <dd className="mt-1 text-sm text-gray-900">{member.email}</dd>
        </div>
        
        <div>
          <dt className="text-sm font-medium text-gray-500">Phone number</dt>
          <dd className="mt-1 text-sm text-gray-900">{member.phoneNumber}</dd>
        </div>
        
        <div className="col-span-2">
          <dt className="text-sm font-medium text-gray-500">Address</dt>
          <dd className="mt-1 text-sm text-gray-900">{member.address || 'No address provided'}</dd>
        </div>
        
        <div>
          <dt className="text-sm font-medium text-gray-500">Member since</dt>
          <dd className="mt-1 text-sm text-gray-900">{formatDate(member.dateJoined)}</dd>
        </div>
        
        <div>
          <dt className="text-sm font-medium text-gray-500">Status</dt>
          <dd className="mt-1 text-sm">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {member.isActive ? 'Active' : 'Inactive'}
            </span>
          </dd>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
        <p className="mt-1 text-sm text-gray-500">Details about the member's account.</p>
        
        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
          <div>
            <dt className="text-sm font-medium text-gray-500">Role</dt>
            <dd className="mt-1 text-sm text-gray-900">{member.role.charAt(0).toUpperCase() + member.role.slice(1)}</dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-gray-500">Account created</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(member.createdAt)}</dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-gray-500">Last updated</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(member.updatedAt)}</dd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
