import { useState, useEffect } from 'react';
import { User, Payment, MemberDue, MemberLevy, Pledge, Loan, PaymentStatus } from '../../types';
import * as api from '../../services/api';
import { toast } from 'react-toastify';

interface MemberDetailsViewProps {
  memberId: string;
  onClose: () => void;
  onEdit: (member: User) => void;
}

const MemberDetailsView = ({ memberId, onClose, onEdit }: MemberDetailsViewProps) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [member, setMember] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [dues, setDues] = useState<MemberDue[]>([]);
  const [levies, setLevies] = useState<MemberLevy[]>([]);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMemberData();
  }, [memberId]);

  const fetchMemberData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching data for member ID:', memberId);
      
      // Fetch member details
      const memberResponse = await api.get<{ user: User }>(`/users/${memberId}`);
      console.log('Member response:', memberResponse);
      
      if (memberResponse.success && memberResponse.data?.user) {
        setMember(memberResponse.data.user);
        
        // Fetch member payments - corrected endpoint
        const paymentsResponse = await api.get<{ payments: Payment[] }>(`/payments/member/${memberId}`);
        console.log('Payments response:', paymentsResponse);
        if (paymentsResponse.success) {
          setPayments(paymentsResponse.data?.payments || []);
        } else {
          console.error('Failed to fetch payments:', paymentsResponse.message);
        }
        
        // Fetch member dues - corrected endpoint
        const duesResponse = await api.get<{ memberDues: MemberDue[] }>(`/dues/members/user/${memberId}`);
        console.log('Dues response:', duesResponse);
        if (duesResponse.success) {
          setDues(duesResponse.data?.memberDues || []);
        } else {
          console.error('Failed to fetch dues:', duesResponse.message);
        }
        
        // Fetch member levies - corrected endpoint
        const leviesResponse = await api.get<{ memberLevies: MemberLevy[] }>(`/levies/members/user/${memberId}`);
        console.log('Levies response:', leviesResponse);
        if (leviesResponse.success) {
          setLevies(leviesResponse.data?.memberLevies || []);
        } else {
          console.error('Failed to fetch levies:', leviesResponse.message);
        }
        
        // Fetch member pledges - corrected endpoint
        const pledgesResponse = await api.get<{ pledges: Pledge[] }>(`/pledges/member/${memberId}`);
        console.log('Pledges response:', pledgesResponse);
        if (pledgesResponse.success) {
          setPledges(pledgesResponse.data?.pledges || []);
        } else {
          console.error('Failed to fetch pledges:', pledgesResponse.message);
        }
        
        // Fetch member loans - corrected endpoint
        const loansResponse = await api.get<{ loans: Loan[] }>(`/loans/member/${memberId}`);
        console.log('Loans response:', loansResponse);
        if (loansResponse.success) {
          setLoans(loansResponse.data?.loans || []);
        } else {
          console.error('Failed to fetch loans:', loansResponse.message);
        }
      } else {
        setError('Failed to fetch member details');
      }
    } catch (err) {
      console.error('Error fetching member data:', err);
      setError('An error occurred while fetching member data');
    } finally {
      setIsLoading(false);
    }
  };


  const handleExport = async (type: 'pdf' | 'excel') => {
    const toastId = toast.loading(`Preparing ${type.toUpperCase()} export...`);
    
    try {
      // Call the appropriate API endpoint based on the export type
      const response = await fetch(`/api/users/members/${memberId}/export/${type}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to export member details to ${type.toUpperCase()}`);
      }
      
      // Convert the response to a blob
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `member_${member?.membershipId || memberId}_details.${type}`;
      
      // Append the link to the document
      document.body.appendChild(link);
      
      // Click the link to trigger the download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success notification
      toast.update(toastId, { 
        render: `Member details exported to ${type.toUpperCase()} successfully`, 
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });
    } catch (error) {
      console.error(`Error exporting member details to ${type}:`, error);
      toast.update(toastId, { 
        render: `Failed to export member details to ${type.toUpperCase()}`, 
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800">{error || 'Member not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      {/* Member header */}
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Member Details
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {member.firstName} {member.lastName} ({member.membershipId || 'No ID'})
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            onClick={() => handleExport('excel')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Excel
          </button>
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={() => handleExport('pdf')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Export PDF
          </button>
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={() => onEdit(member)}
          >
            Edit Member
          </button>
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`${
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`${
              activeTab === 'payments'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab('dues')}
            className={`${
              activeTab === 'dues'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Dues
          </button>
          <button
            onClick={() => setActiveTab('levies')}
            className={`${
              activeTab === 'levies'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Levies
          </button>
          <button
            onClick={() => setActiveTab('pledges')}
            className={`${
              activeTab === 'pledges'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Pledges
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`${
              activeTab === 'loans'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Loans
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="px-4 py-5 sm:p-6">
        {activeTab === 'profile' && (
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
        )}
        
        {activeTab === 'payments' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment History</h3>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No payment records found for this member.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(payment.paymentDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.description?.includes('due') ? 'Due' : 
                           payment.description?.includes('levy') ? 'Levy' : 
                           payment.description?.includes('pledge') ? 'Pledge' : 
                           payment.description?.includes('donation') ? 'Donation' : 'Payment'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(payment.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.status === PaymentStatus.APPROVED ? 'bg-green-100 text-green-800' : 
                            payment.status === PaymentStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4">
              <button
                onClick={() => onEdit(member)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Add Payment
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'dues' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Member Dues</h3>
            {dues.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No dues assigned to this member.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dues.map((due) => (
                      <tr key={due._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {typeof due.due === 'string' ? 'Due' : due.due.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(typeof due.due === 'string' ? due.amountPaid + due.balance : due.due.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            due.status === PaymentStatus.APPROVED ? 'bg-green-100 text-green-800' : 
                            due.status === PaymentStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {due.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'levies' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Member Levies</h3>
            {levies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No levies assigned to this member.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Levy</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {levies.map((levy) => (
                      <tr key={levy._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {typeof levy.levy === 'string' ? 'Levy' : levy.levy.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(typeof levy.levy === 'string' ? levy.amountPaid + levy.balance : levy.levy.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            levy.status === PaymentStatus.APPROVED ? 'bg-green-100 text-green-800' : 
                            levy.status === PaymentStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {levy.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'pledges' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Member Pledges</h3>
            {pledges.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No pledges found for this member.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pledges.map((pledge) => (
                      <tr key={pledge._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pledge.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(pledge.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            pledge.status === PaymentStatus.APPROVED ? 'bg-green-100 text-green-800' : 
                            pledge.status === PaymentStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {pledge.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'loans' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Member Loans</h3>
            {loans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No loans found for this member.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loans.map((loan) => (
                      <tr key={loan._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(loan.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.purpose}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            loan.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDetailsView;
