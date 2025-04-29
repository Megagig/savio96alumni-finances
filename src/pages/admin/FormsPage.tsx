import { useState } from 'react';
import CreateDueForm from './forms/CreateDueForm';
import CreateLevyForm from './forms/CreateLevyForm';
import RecordTransactionForm from './forms/RecordTransactionForm';

const FormsPage = () => {
  const [activeTab, setActiveTab] = useState<'dues' | 'levies' | 'transactions'>('dues');

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Forms</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('dues')}
                className={`${
                  activeTab === 'dues'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Create Due
              </button>
              <button
                onClick={() => setActiveTab('levies')}
                className={`${
                  activeTab === 'levies'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Create Levy
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`${
                  activeTab === 'transactions'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Record Transaction
              </button>
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === 'dues' && <CreateDueForm />}
            {activeTab === 'levies' && <CreateLevyForm />}
            {activeTab === 'transactions' && <RecordTransactionForm />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormsPage;
