import React from 'react';
import { Link } from 'react-router-dom';
import LandingHeader from '../components/layout/LandingHeader';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <LandingHeader />

      {/* Hero Section */}
      <div className="relative bg-primary-700 pt-32">
        <div className="absolute inset-0">
          <img
            className="h-full w-full object-cover opacity-20"
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
            alt="Team working together"
          />
          <div className="absolute inset-0 bg-primary-700 mix-blend-multiply" />
        </div>
        <div className="relative py-28 px-6 sm:py-36 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl drop-shadow-md">About Financial Hub</h1>
            <p className="mt-6 text-xl leading-8 text-gray-200 drop-shadow-sm">
              Our mission is to provide a transparent, efficient, and user-friendly platform for managing financial resources within communities and organizations.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white py-16 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Our Story Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">Our Story</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <p className="text-lg text-gray-600 mb-4">
                  Financial Hub was born out of a need to simplify financial management for community organizations, alumni associations, and professional groups. We recognized that many organizations struggle with tracking dues, managing loans, and maintaining transparency in their financial operations.
                </p>
                <p className="text-lg text-gray-600 mb-4">
                  Founded in 2023, our platform has grown to serve numerous organizations across the country, helping them streamline their financial processes and build trust among their members.
                </p>
              </div>
              <div>
                <p className="text-lg text-gray-600 mb-4">
                  Our team consists of financial experts, software engineers, and user experience designers who are passionate about creating tools that make financial management accessible to everyone.
                </p>
                <p className="text-lg text-gray-600">
                  We believe that financial transparency is the foundation of trust in any organization, and our platform is designed to foster that transparency while making financial management efficient and stress-free.
                </p>
              </div>
            </div>
          </div>

          {/* Our Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">Our Values</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="h-12 w-12 bg-primary-600 rounded-md flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparency</h3>
                <p className="text-gray-600">
                  We believe in complete transparency in all financial matters. Our platform provides clear visibility into all transactions, ensuring that everyone has access to the information they need.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="h-12 w-12 bg-primary-600 rounded-md flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Security</h3>
                <p className="text-gray-600">
                  Your financial data is sensitive, and we treat it with the utmost care. Our platform employs industry-standard security measures to protect your information.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="h-12 w-12 bg-primary-600 rounded-md flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Community</h3>
                <p className="text-gray-600">
                  We're building more than just a financial tool—we're fostering communities. Our platform helps strengthen the bonds within your organization through fair and transparent financial management.
                </p>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">Our Team</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto h-40 w-40 rounded-full overflow-hidden mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
                    alt="Team member"
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">John Doe</h3>
                <p className="text-primary-600 mb-2">CEO & Founder</p>
                <p className="text-gray-600">
                  With over 15 years of experience in financial technology, John leads our vision and strategy.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-40 w-40 rounded-full overflow-hidden mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
                    alt="Team member"
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Jane Smith</h3>
                <p className="text-primary-600 mb-2">CTO</p>
                <p className="text-gray-600">
                  Jane oversees our technical strategy and ensures that our platform remains secure, scalable, and innovative.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-40 w-40 rounded-full overflow-hidden mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
                    alt="Team member"
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Michael Johnson</h3>
                <p className="text-primary-600 mb-2">Head of Customer Success</p>
                <p className="text-gray-600">
                  Michael and his team ensure that our customers receive the support they need to make the most of our platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-700">
        <div className="mx-auto max-w-7xl py-12 px-6 lg:flex lg:items-center lg:justify-between lg:py-16 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-primary-300">Join our platform today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-primary-600 hover:bg-primary-50"
              >
                Get started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-5 py-3 text-base font-medium text-white hover:bg-primary-700"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl py-12 px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center space-x-6 md:order-2">
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <div className="mt-8 md:order-1 md:mt-0">
              <p className="text-center text-base text-gray-400">&copy; {new Date().getFullYear()} Financial Hub. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
