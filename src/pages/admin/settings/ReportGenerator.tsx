import { useState } from 'react';

type ReportType = 'financial' | 'members' | 'payments' | 'loans' | 'dues';
type ReportFormat = 'pdf' | 'excel';

const ReportGenerator = () => {
  const [reportType, setReportType] = useState<ReportType>('financial');
  const [reportFormat, setReportFormat] = useState<ReportFormat>('pdf');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let url = `/reports/${reportType}/${reportFormat}`;
      const queryParams = new URLSearchParams();
      
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
      
      // Get the authentication token
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setIsLoading(false);
        return;
      }
      
      // Create a temporary hidden form to submit the request with the token
      const form = document.createElement('form');
      form.method = 'GET';
      form.action = `${import.meta.env.VITE_API_URL}${url}`;
      form.target = '_blank';
      
      // Add the token as a hidden field
      const tokenField = document.createElement('input');
      tokenField.type = 'hidden';
      tokenField.name = 'token';
      tokenField.value = token;
      form.appendChild(tokenField);
      
      // Submit the form
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      
      setSuccess(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully`);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('An error occurred while generating report');
    } finally {
      setIsLoading(false);
    }
  };

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
        <label htmlFor="reportType" className="block text-sm font-medium text-gray-700">
          Report Type
        </label>
        <div className="mt-1">
          <select
            id="reportType"
            name="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="financial">Financial Summary</option>
            <option value="members">Members Report</option>
            <option value="payments">Payments Report</option>
            <option value="loans">Loans Report</option>
            <option value="dues">Dues Report</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="reportFormat" className="block text-sm font-medium text-gray-700">
          Report Format
        </label>
        <div className="mt-1">
          <select
            id="reportFormat"
            name="reportFormat"
            value={reportFormat}
            onChange={(e) => setReportFormat(e.target.value as ReportFormat)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <div className="mt-1">
            <input
              type="date"
              name="startDate"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <div className="mt-1">
            <input
              type="date"
              name="endDate"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
    </form>
  );
};

export default ReportGenerator;
