import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const SupportPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('contact');

  const faqs = [
    {
      question: 'How do I make a payment?',
      answer:
        'To make a payment, navigate to the Payments page and select "Upload Receipt". Fill out the payment form with the amount, description, and upload your payment receipt. Once submitted, an administrator will review and approve your payment.',
    },
    {
      question: 'How do I apply for a loan?',
      answer:
        'To apply for a loan, go to the Loans page and select "Apply for Loan". Fill out the application form with the requested amount, purpose, and proposed repayment date. Your application will be reviewed by an administrator who will either approve or reject it.',
    },
    {
      question: 'When will my payment be approved?',
      answer:
        'Payments are typically reviewed and approved within 1-2 business days. You will receive a notification once your payment has been processed.',
    },
    {
      question: 'How do I check my unpaid dues?',
      answer:
        'To check your unpaid dues, navigate to the Payments page and select the "Unpaid Dues" tab. This will show all outstanding dues and their amounts.',
    },
    {
      question: 'How do I update my contact information?',
      answer:
        'To update your contact information, go to the Settings page and select "Profile Update". You can update your name, phone number, and address. Note that email changes require administrator assistance.',
    },
    {
      question: 'What happens if my loan application is rejected?',
      answer:
        'If your loan application is rejected, you will receive a notification with the reason for rejection. You can view the details on the Loans page under "Active Loans" or "Loan History". You may reapply after addressing the issues mentioned in the rejection reason.',
    },
    {
      question: 'How do I repay my loan?',
      answer:
        'To repay your loan, go to the Payments page and select "Upload Receipt". Enter the amount you wish to repay and include "Loan Repayment" in the description. Upload your payment receipt for verification.',
    },
    {
      question: 'How do I change my password?',
      answer:
        'To change your password, navigate to the Settings page and select the "Change Password" tab. Enter your current password and your new password, then confirm the new password and submit the form.',
    },
  ];

  const whatsappNumber = '+2348060374755'; // Replace with actual WhatsApp number
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Hello,%20I%20need%20assistance%20with%20my%20account.%20My%20name%20is%20${user?.firstName}%20${user?.lastName}%20and%20my%20email%20is%20${user?.email}.`;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            Help & Support
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Get help with your account, payments, loans, and more.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('contact')}
            className={`${
              activeTab === 'contact'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Contact Us
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`${
              activeTab === 'faqs'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            FAQs
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Contact Us */}
        {activeTab === 'contact' && (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Contact Support
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  Need help? Contact our support team through one of the
                  channels below.
                </p>
              </div>

              <div className="mt-5 space-y-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-medium text-gray-900">
                      WhatsApp Support
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Chat with our support team on WhatsApp for quick
                      assistance.
                    </p>
                    <div className="mt-3">
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <svg
                          className="h-5 w-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Contact on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-6 w-6 text-primary-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-lg font-medium text-gray-900">
                        Email Support
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        Send us an email and we'll get back to you within 24
                        hours.
                      </p>
                      <div className="mt-3">
                        <a
                          href="mailto:support@financialhub.com"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <svg
                            className="h-5 w-5 mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          Send Email
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-6 w-6 text-primary-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-lg font-medium text-gray-900">
                        Phone Support
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        Call our support team during business hours (9 AM - 5
                        PM, Monday to Friday).
                      </p>
                      <div className="mt-3">
                        <a
                          href="tel:+1234567890"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <svg
                            className="h-5 w-5 mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          Call Support
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQs */}
        {activeTab === 'faqs' && (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Frequently Asked Questions
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  Find answers to common questions about using the Financial
                  Hub.
                </p>
              </div>

              <div className="mt-5 space-y-6">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className={index > 0 ? 'border-t border-gray-200 pt-6' : ''}
                  >
                    <dt className="text-lg font-medium text-gray-900">
                      {faq.question}
                    </dt>
                    <dd className="mt-2 text-sm text-gray-500">{faq.answer}</dd>
                  </div>
                ))}
              </div>

              <div className="mt-8 border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-500">
                  Still have questions? Contact our support team for further
                  assistance.
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => setActiveTab('contact')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportPage;
