import { useState, useEffect } from 'react';
import { getAllDonations, updateDonation, deleteDonation } from '../../services/donation.service';
import { Donation, PaymentStatus } from '../../types';

const DonationsPage = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all donations
  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      const response = await getAllDonations();
      if (response.success) {
        setDonations(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch donations');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching donations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // Handle status update
  const handleStatusUpdate = async (id: string, status: PaymentStatus) => {
    try {
      const response = await updateDonation(id, { status });
      if (response.success) {
        // Update the donation in the local state
        setDonations(donations.map(donation => 
          donation._id === id ? { ...donation, status } : donation
        ));
      } else {
        setError(response.message || 'Failed to update donation status');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating donation status');
    }
  };

  // Handle donation deletion
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this donation?')) {
      return;
    }
    
    try {
      const response = await deleteDonation(id);
      if (response.success) {
        // Remove the donation from the local state
        setDonations(donations.filter(donation => donation._id !== id));
      } else {
        setError(response.message || 'Failed to delete donation');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting donation');
    }
  };

  // Open modal with donation details
  const openDonationDetails = (donation: Donation) => {
    setSelectedDonation(donation);
    setIsModalOpen(true);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case PaymentStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Donations</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all donations made by members.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          {error}
          <button
            className="ml-2 text-red-600 hover:text-red-800"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        Member
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Purpose
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                      >
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {donations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-sm text-gray-500">
                          No donations found
                        </td>
                      </tr>
                    ) : (
                      donations.map((donation) => (
                        <tr key={donation._id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <div className="font-medium text-gray-900">
                              {typeof donation.user === 'object' 
                                ? `${donation.user.firstName} ${donation.user.lastName}`
                                : 'Unknown User'}
                            </div>
                            <div className="text-gray-500">
                              {typeof donation.user === 'object' ? donation.user.email : ''}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="text-gray-900">{donation.purpose}</div>
                            <div className="text-gray-500 truncate max-w-xs">
                              {donation.description || 'No description'}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            ₦{donation.amount.toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(donation.donationDate)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeClass(donation.status)}`}>
                              {donation.status}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => openDonationDetails(donation)}
                              className="text-primary-600 hover:text-primary-900 mr-4"
                            >
                              View
                            </button>
                            {donation.status === PaymentStatus.PENDING && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(donation._id, PaymentStatus.APPROVED)}
                                  className="text-green-600 hover:text-green-900 mr-4"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(donation._id, PaymentStatus.REJECTED)}
                                  className="text-red-600 hover:text-red-900 mr-4"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDelete(donation._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donation Details Modal */}
      {isModalOpen && selectedDonation && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Donation Details</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Member</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {typeof selectedDonation.user === 'object'
                    ? `${selectedDonation.user.firstName} ${selectedDonation.user.lastName}`
                    : 'Unknown User'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Purpose</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedDonation.purpose}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Amount</h4>
                <p className="mt-1 text-sm text-gray-900">₦{selectedDonation.amount.toLocaleString()}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedDonation.description || 'No description'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Date</h4>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedDonation.donationDate)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <p className="mt-1">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeClass(selectedDonation.status)}`}>
                    {selectedDonation.status}
                  </span>
                </p>
              </div>
              {selectedDonation.status === PaymentStatus.PENDING && (
                <div className="flex space-x-4 mt-4">
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedDonation._id, PaymentStatus.APPROVED);
                      setIsModalOpen(false);
                    }}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedDonation._id, PaymentStatus.REJECTED);
                      setIsModalOpen(false);
                    }}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationsPage;
