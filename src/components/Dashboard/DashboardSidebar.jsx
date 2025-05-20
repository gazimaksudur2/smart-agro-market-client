import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaHome, 
  FaUserCircle, 
  FaShoppingCart, 
  FaBoxOpen, 
  FaPlus,
  FaWarehouse,
  FaUsersCog,
  FaChartLine,
  FaClipboardList,
  FaUserCheck,
  FaTruck
} from 'react-icons/fa';

export default function DashboardSidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { userRole, currentUser } = useAuth();
  
  // Close sidebar when clicking outside on mobile
  const closeSidebar = () => {
    setSidebarOpen(false);
  };
  
  // Path is active if it matches the current location
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Mobile sidebar backdrop
  const mobileBackdrop = (
    <div 
      className={`fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden ${
        sidebarOpen ? 'ease-out duration-300 opacity-100' : 'ease-in duration-200 opacity-0 pointer-events-none'
      }`} 
      onClick={closeSidebar}
      aria-hidden="true"
    />
  );
  
  // Common links for all users
  const commonLinks = [
    {
      to: '/dashboard',
      icon: <FaHome className="mr-3 h-6 w-6" />,
      label: 'Dashboard',
      exact: true
    },
    {
      to: '/dashboard/profile',
      icon: <FaUserCircle className="mr-3 h-6 w-6" />,
      label: 'My Profile'
    }
  ];
  
  // Role-specific links
  const roleLinks = {
    admin: [
      {
        to: '/dashboard/admin',
        icon: <FaChartLine className="mr-3 h-6 w-6" />,
        label: 'Admin Dashboard'
      },
      {
        to: '/dashboard/admin/agents',
        icon: <FaUserCheck className="mr-3 h-6 w-6" />,
        label: 'Agent Applications'
      },
      {
        to: '/dashboard/admin/users',
        icon: <FaUsersCog className="mr-3 h-6 w-6" />,
        label: 'Manage Users'
      },
      {
        to: '/dashboard/admin/products',
        icon: <FaBoxOpen className="mr-3 h-6 w-6" />,
        label: 'All Products'
      },
      {
        to: '/dashboard/admin/orders',
        icon: <FaClipboardList className="mr-3 h-6 w-6" />,
        label: 'All Orders'
      }
    ],
    agent: [
      {
        to: '/dashboard/agent',
        icon: <FaWarehouse className="mr-3 h-6 w-6" />,
        label: 'Agent Dashboard'
      },
      {
        to: '/dashboard/agent/sellers',
        icon: <FaUserCheck className="mr-3 h-6 w-6" />,
        label: 'Verify Sellers'
      },
      {
        to: '/dashboard/agent/products',
        icon: <FaBoxOpen className="mr-3 h-6 w-6" />,
        label: 'Product Approval'
      },
      {
        to: '/dashboard/agent/deliveries',
        icon: <FaTruck className="mr-3 h-6 w-6" />,
        label: 'Manage Deliveries'
      }
    ],
    seller: [
      {
        to: '/dashboard/my-products',
        icon: <FaBoxOpen className="mr-3 h-6 w-6" />,
        label: 'My Products'
      },
      {
        to: '/dashboard/add-product',
        icon: <FaPlus className="mr-3 h-6 w-6" />,
        label: 'Add New Product'
      },
      {
        to: '/dashboard/seller/orders',
        icon: <FaClipboardList className="mr-3 h-6 w-6" />,
        label: 'Orders Received'
      }
    ],
    consumer: [
      {
        to: '/dashboard/my-orders',
        icon: <FaShoppingCart className="mr-3 h-6 w-6" />,
        label: 'My Orders'
      }
    ]
  };

  // Get links based on user role
  const getNavLinks = () => {
    return [...commonLinks, ...(roleLinks[userRole] || roleLinks.consumer)];
  };

  // Create nav link
  const NavLink = ({ to, icon, label }) => (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 text-base font-medium rounded-md ${
        isActive(to)
          ? 'bg-primary-100 text-primary-900'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
      onClick={() => setSidebarOpen(false)}
    >
      {icon}
      {label}
    </Link>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileBackdrop}
      
      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 flex z-40 lg:hidden transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
          {/* Close button */}
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={closeSidebar}
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Mobile sidebar content */}
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-display font-bold text-primary-600">SmartAgro</span>
                <span className="ml-1 text-xl font-display font-bold text-gray-700">Connect</span>
              </Link>
            </div>
            <div className="mt-5 px-2 space-y-1">
              {getNavLinks().map((link, index) => (
                <NavLink key={index} {...link} />
              ))}
            </div>
          </div>
          
          {/* User info for mobile */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div>
                <img
                  className="inline-block h-10 w-10 rounded-full"
                  src={currentUser?.photoURL || "https://i.ibb.co/MBtjqXQ/no-avatar.gif"}
                  alt={currentUser?.displayName || "User"}
                />
              </div>
              <div className="ml-3">
                <p className="text-base font-medium text-gray-700 truncate">
                  {currentUser?.displayName || "User"}
                </p>
                <p className="text-sm font-medium text-gray-500 truncate capitalize">
                  {userRole}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 w-14" aria-hidden="true">
          {/* Force sidebar to shrink to fit close icon */}
        </div>
      </div>
      
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-display font-bold text-primary-600">SmartAgro</span>
                <span className="ml-1 text-xl font-display font-bold text-gray-700">Connect</span>
              </Link>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto pt-4">
              <nav className="flex-1 px-2 pb-4 space-y-1">
                {getNavLinks().map((link, index) => (
                  <NavLink key={index} {...link} />
                ))}
              </nav>
            </div>
            
            {/* User info for desktop */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div>
                  <img
                    className="inline-block h-9 w-9 rounded-full"
                    src={currentUser?.photoURL || "https://i.ibb.co/MBtjqXQ/no-avatar.gif"}
                    alt={currentUser?.displayName || "User"}
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {currentUser?.displayName || "User"}
                  </p>
                  <p className="text-xs font-medium text-gray-500 truncate capitalize">
                    {userRole}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 