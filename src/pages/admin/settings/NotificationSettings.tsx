import { useState, useEffect } from 'react';
import * as api from '../../../services/api';

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface BackendNotificationSettings {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  dueReminders?: boolean;
  paymentConfirmations?: boolean;
  loanUpdates?: boolean;
  [key: string]: boolean | undefined;
}

const NotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'payment_reminder',
      name: 'Payment Reminders',
      description: 'Send reminders to members about upcoming dues',
      enabled: true,
    },
    {
      id: 'payment_confirmation',
      name: 'Payment Confirmations',
      description: 'Send confirmation emails when payments are received',
      enabled: true,
    },
    {
      id: 'loan_updates',
      name: 'Loan Updates',
      description: 'Send notifications when loan status changes',
      enabled: true,
    },
    {
      id: 'new_member',
      name: 'New Member Notifications',
      description: 'Send notifications when new members join',
      enabled: false,
    },
    {
      id: 'monthly_summary',
      name: 'Monthly Summary',
      description: 'Send monthly financial summary to all members',
      enabled: false,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    setIsFetching(true);
    try {
      console.log('Fetching notification settings...');
      const response = await api.get<BackendNotificationSettings>('/users/notification-settings');
      console.log('Notification settings response:', response);
      
      if (response.success && response.data) {
        // Map backend notification settings to frontend format
        const mappedSettings = [
          {
            id: 'payment_reminder',
            name: 'Payment Reminders',
            description: 'Send reminders to members about upcoming dues',
            enabled: response.data.dueReminders ?? true,
          },
          {
            id: 'payment_confirmation',
            name: 'Payment Confirmations',
            description: 'Send confirmation emails when payments are received',
            enabled: response.data.paymentConfirmations ?? true,
          },
          {
            id: 'loan_updates',
            name: 'Loan Updates',
            description: 'Send notifications when loan status changes',
            enabled: response.data.loanUpdates ?? true,
          },
          {
            id: 'new_member',
            name: 'New Member Notifications',
            description: 'Send notifications when new members join',
            enabled: response.data.emailNotifications ?? false,
          },
          {
            id: 'monthly_summary',
            name: 'Monthly Summary',
            description: 'Send monthly financial summary to all members',
            enabled: response.data.smsNotifications ?? false,
          },
        ];
        setSettings(mappedSettings);
      }
    } catch (err) {
      console.error('Error fetching notification settings:', err);
      // Using default settings if API fails
    } finally {
      setIsFetching(false);
    }
  };

  const handleToggle = (id: string) => {
    setSettings(settings.map(setting => 
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Map frontend settings to backend format
      const notificationSettings = {
        emailNotifications: settings.find(s => s.id === 'new_member')?.enabled ?? false,
        smsNotifications: settings.find(s => s.id === 'monthly_summary')?.enabled ?? false,
        dueReminders: settings.find(s => s.id === 'payment_reminder')?.enabled ?? true,
        paymentConfirmations: settings.find(s => s.id === 'payment_confirmation')?.enabled ?? true,
        loanUpdates: settings.find(s => s.id === 'loan_updates')?.enabled ?? true
      };
      
      console.log('Updating notification settings:', notificationSettings);
      const response = await api.put('/users/notification-settings', notificationSettings);
      console.log('Update response:', response);
      
      if (response.success) {
        setSuccess('Notification settings updated successfully');
      } else {
        console.error('Failed to update notification settings:', response);
        setError(response.message || 'Failed to update notification settings');
      }
    } catch (err: any) {
      console.error('Error updating notification settings:', err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'An error occurred while updating notification settings';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
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

      <div className="space-y-4">
        {settings.map((setting) => (
          <div key={setting.id} className="relative flex items-start">
            <div className="flex h-5 items-center">
              <input
                id={setting.id}
                name={setting.id}
                type="checkbox"
                checked={setting.enabled}
                onChange={() => handleToggle(setting.id)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor={setting.id} className="font-medium text-gray-700">
                {setting.name}
              </label>
              <p className="text-gray-500">{setting.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
};

export default NotificationSettings;
