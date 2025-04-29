import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

const Sidebar = () => {
  const { user } = useAuth();
  
  // Define navigation items for each role level
  const memberNavigation = [
    { name: 'Dashboard', href: '/', icon: 'home' },
    { name: 'Payments', href: '/payments', icon: 'credit-card' },
    { name: 'Loans', href: '/loans', icon: 'currency-dollar' },
    { name: 'Settings', href: '/settings', icon: 'cog' },
    { name: 'Help & Support', href: '/support', icon: 'question-mark-circle' },
  ];
  
  // Admin Level 1 can access Members, Donations, and Support
  const adminLevel1Navigation = [
    { name: 'Dashboard', href: '/admin', icon: 'home' },
    { name: 'Members', href: '/admin/members', icon: 'users' },
    { name: 'Donations', href: '/admin/donations', icon: 'gift' },
    { name: 'Help & Support', href: '/admin/support', icon: 'question-mark-circle' },
  ];
  
  // Admin Level 2 can access everything Admin Level 1 can, plus Loans
  const adminLevel2Navigation = [
    ...adminLevel1Navigation,
    { name: 'Loans', href: '/admin/loans', icon: 'currency-dollar' },
  ];
  
  // Super Admin can access everything
  const superAdminNavigation = [
    { name: 'Dashboard', href: '/admin', icon: 'home' },
    { name: 'Members', href: '/admin/members', icon: 'users' },
    { name: 'Payments', href: '/admin/payments', icon: 'credit-card' },
    { name: 'Donations', href: '/admin/donations', icon: 'gift' },
    { name: 'Loans', href: '/admin/loans', icon: 'currency-dollar' },
    { name: 'Accounting', href: '/admin/accounting', icon: 'chart-bar' },
    { name: 'Forms', href: '/admin/forms', icon: 'document-add' },
    { name: 'Settings', href: '/admin/settings', icon: 'cog' },
    { name: 'Help & Support', href: '/admin/support', icon: 'question-mark-circle' },
  ];
  
  // Legacy admin role - map to Admin Level 1 for backward compatibility
  const legacyAdminNavigation = adminLevel1Navigation;
  
  // Select navigation based on user role
  let navigation;
  switch (user?.role) {
    case UserRole.ADMIN:
      navigation = legacyAdminNavigation;
      break;
    case UserRole.ADMIN_LEVEL_1:
      navigation = adminLevel1Navigation;
      break;
    case UserRole.ADMIN_LEVEL_2:
      navigation = adminLevel2Navigation;
      break;
    case UserRole.SUPER_ADMIN:
      navigation = superAdminNavigation;
      break;
    default:
      navigation = memberNavigation;
  }

  // Use the navigation items based on role
  const filteredNavigation = navigation;

  // Render icon based on name
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'credit-card':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'calendar':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'gift':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        );
      case 'heart':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'cash':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'currency-dollar':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'users':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'chart-bar':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'cog':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'question-mark-circle':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'document-add':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        );
    }
  };

  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white overflow-y-auto">
      <div className="flex flex-shrink-0 items-center px-4 py-4 sm:py-5">
        <div className="h-8 w-auto">
          <h1 className="text-lg sm:text-xl font-bold text-primary-600 truncate">Financial Hub</h1>
        </div>
      </div>
      <div className="mt-2 sm:mt-5 flex flex-grow flex-col">
        <nav className="flex-1 space-y-1 px-2 pb-4">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-xs sm:text-sm font-medium rounded-md`
              }
            >
              <div className="mr-2 sm:mr-3 flex-shrink-0 text-gray-400 group-hover:text-gray-500">
                {renderIcon(item.icon)}
              </div>
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="flex flex-shrink-0 border-t border-gray-200 p-3 sm:p-4">
        <div className="flex items-center w-full overflow-hidden">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary-600 flex items-center justify-center text-white">
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </div>
          </div>
          <div className="ml-3 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs font-medium text-gray-500 capitalize truncate">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
