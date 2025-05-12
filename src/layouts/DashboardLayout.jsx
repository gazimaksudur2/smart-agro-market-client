import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiMenu, FiX } from 'react-icons/fi';
import { 
  MdDashboard, 
  MdSupervisorAccount, 
  MdAnalytics,
  MdVerified,
  MdLocalShipping,
  MdAddBusiness,
  MdInventory,
  MdShoppingCart
} from 'react-icons/md';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { currentUser, isAdmin, isAgent, isSeller, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const getNavLinks = () => {
    if (isAdmin()) {
      return [
        { to: '/dashboard/admin', icon: <MdDashboard />, label: 'Dashboard' },
        { to: '/dashboard/admin/agents', icon: <MdSupervisorAccount />, label: 'Manage Agents' },
        { to: '/dashboard/admin/users', icon: <MdSupervisorAccount />, label: 'Manage Users' },
        { to: '/dashboard/admin/analytics', icon: <MdAnalytics />, label: 'Analytics' },
      ];
    }
    if (isAgent()) {
      return [
        { to: '/dashboard/agent', icon: <MdDashboard />, label: 'Dashboard' },
        { to: '/dashboard/agent/verify-sellers', icon: <MdVerified />, label: 'Verify Sellers' },
        { to: '/dashboard/agent/verify-products', icon: <MdVerified />, label: 'Verify Products' },
        { to: '/dashboard/agent/deliveries', icon: <MdLocalShipping />, label: 'Manage Deliveries' },
      ];
    }
    if (isSeller()) {
      return [
        { to: '/dashboard/seller', icon: <MdDashboard />, label: 'Dashboard' },
        { to: '/dashboard/seller/add-product', icon: <MdAddBusiness />, label: 'Add Product' },
        { to: '/dashboard/seller/my-products', icon: <MdInventory />, label: 'My Products' },
        { to: '/dashboard/seller/my-orders', icon: <MdShoppingCart />, label: 'My Orders' },
      ];
    }
    return [
      { to: '/dashboard/consumer', icon: <MdDashboard />, label: 'Dashboard' },
      { to: '/dashboard/consumer/purchases', icon: <MdShoppingCart />, label: 'My Purchases' },
    ];
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white border-r border-gray-200`}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-primary-600 text-white">
          <Link to="/" className="text-xl font-semibold">
            SmartAgro Connect
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 rounded-lg hover:bg-primary-700 lg:hidden"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="py-4 overflow-y-auto">
          <nav className="space-y-2 px-4">
            {getNavLinks().map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-gray-900 rounded-lg hover:bg-gray-100 ${
                    isActive ? 'bg-primary-50 text-primary-600' : ''
                  }`
                }
              >
                <span className="w-5 h-5 mr-3">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className={`p-4 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
        <div className="mb-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{currentUser?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        <main className="p-4 bg-white rounded-lg shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
}