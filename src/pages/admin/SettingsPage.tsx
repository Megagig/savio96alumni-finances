import { useState } from 'react';
import AddMemberForm from './settings/AddMemberForm';
import PromoteMemberForm from './settings/PromoteMemberForm';
import BulkUploadForm from './settings/BulkUploadForm';
import NotificationSettings from './settings/NotificationSettings';
import ReportGenerator from './settings/ReportGenerator';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('members');
  const { user } = useAuth();
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  
  // If not a super admin, show access denied message
  if (!isSuperAdmin) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Access Restricted</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Only Super Admins can access the settings page. Please contact a Super Admin if you need assistance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Settings</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage members, configure notifications, and generate reports.
          </p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('members')}
            className={`${
              activeTab === 'members'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Member Management
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`${
              activeTab === 'bulk'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Bulk Upload
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`${
              activeTab === 'notifications'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`${
              activeTab === 'reports'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Reports
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'members' && (
          <div className="space-y-8">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Add New Member</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Create a new member account with basic information.</p>
                </div>
                <div className="mt-5">
                  <AddMemberForm />
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Promote Member to Admin Role</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Promote an existing member to Admin Level 1, Admin Level 2, or Super Admin role with appropriate privileges.</p>
                </div>
                <div className="mt-5">
                  <PromoteMemberForm />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'bulk' && (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Bulk Upload</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Upload CSV files to bulk import dues, payments, income, and expenses.</p>
              </div>
              <div className="mt-5">
                <BulkUploadForm />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'notifications' && (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Notification Settings</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Configure system-wide notification preferences.</p>
              </div>
              <div className="mt-5">
                <NotificationSettings />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'reports' && (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Generate Reports</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Generate and download financial reports in PDF or Excel format.</p>
              </div>
              <div className="mt-5">
                <ReportGenerator />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
