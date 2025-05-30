import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import MainLayout from "../layouts/MainLayout";
import About from "../pages/About";
import Products from "../pages/Products";
import Help from "../pages/Help";
import Contact from "../pages/Contact";
import Terms from "../pages/Terms";
import Privacy from "../pages/Privacy";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import DashboardLayout from "../layouts/DashboardLayout";
// Centralized Dashboard Components
import {
	Profile,
	ConsumerMyCart,
	ConsumerMyOrders,
	ConsumerMyPurchases,
	SellerMyProducts,
	SellerAddProduct,
	SellerRequestedOrders,
	AgentDashboard,
	AgentVerifySellers,
	AgentVerifyProducts,
	AgentManageDeliveries,
	AgentWarehouseManagement,
	AdminAnalytics,
	AdminManageProducts,
	AdminManageOrders,
	AdminManageUsers,
	AdminManageApplications,
	SellerSalesAnalytics,
} from "../components/Dashboard/pages";

// Route Protection Components
import PrivateRoute from "./PrivateRoute";
import {
	AdminRoute,
	AgentRoute,
	SellerRoute,
	ConsumerRoute,
} from "./RoleBasedRoute";

import NotFound from "../pages/NotFound";
import ProductDetails from "../components/Products/ProductDetails";
import OrderDetails from "../components/orders/OrderDetails";

// Cart and Checkout Pages
import CartPage from "../components/Cart/CartPage";
import CheckoutPage from "../components/Checkout/CheckoutPage";
import OrderSuccessPage from "../components/Checkout/OrderSuccessPage";

// Application Pages
import SellerApplicationPage from "../pages/SellerApplicationPage";
import AgentApplicationPage from "../pages/AgentApplicationPage";
import SystemSettings from "../components/Dashboard/pages/admin/SystemSettings";
import DashboardNothing from "../components/Dashboard/pages/DashboardNothing";

const Router = createBrowserRouter([
	{
		path: "/",
		element: <MainLayout />,
		errorElement: <NotFound />,
		children: [
			{
				index: true,
				element: <Home />,
			},
			{
				path: "/about",
				element: <About />,
			},
			{
				path: "/products",
				element: <Products />,
			},
			{
				path: "/product/:id",
				element: <ProductDetails />,
			},
			{
				path: "/cart",
				element: <CartPage />,
			},
			{
				path: "/checkout",
				element: (
					<PrivateRoute>
						<CheckoutPage />
					</PrivateRoute>
				),
			},
			{
				path: "/order-success",
				element: (
					<PrivateRoute>
						<OrderSuccessPage />
					</PrivateRoute>
				),
			},
			{
				path: "/order/:id",
				element: (
					<PrivateRoute>
						<OrderDetails />
					</PrivateRoute>
				),
			},
			{
				path: "/login",
				element: <Login />,
			},
			{
				path: "/register",
				element: <Register />,
			},
			{
				path: "/help",
				element: <Help />,
			},
			{
				path: "/contact",
				element: <Contact />,
			},
			{
				path: "/terms",
				element: <Terms />,
			},
			{
				path: "/privacy",
				element: <Privacy />,
			},
			{
				path: "/seller-application",
				element: <SellerApplicationPage />,
			},
			{
				path: "/agent-application",
				element: <AgentApplicationPage />,
			},
		],
	},
	{
		path: "/dashboard",
		element: (
			<PrivateRoute>
				<DashboardLayout />
			</PrivateRoute>
		),
		children: [
			// Common Routes (Available to all authenticated users)
			{
				index: true,
				element: <DashboardNothing />,
			},
			{
				path: "profile",
				element: <Profile />,
			},
			{
				path: "order/:id",
				element: <OrderDetails />,
			},

			// Consumer Routes
			{
				path: "my-cart",
				element: (
					<ConsumerRoute>
						<ConsumerMyCart />
					</ConsumerRoute>
				),
			},
			{
				path: "my-orders",
				element: (
					<ConsumerRoute>
						<ConsumerMyOrders />
					</ConsumerRoute>
				),
			},
			{
				path: "my-purchases",
				element: (
					<ConsumerRoute>
						<ConsumerMyPurchases />
					</ConsumerRoute>
				),
			},
			{
				path: "wishlist",
				element: (
					<ConsumerRoute>
						<ConsumerMyCart /> // Here need changes
					</ConsumerRoute>
				),
			},

			// Seller Routes
			{
				path: "my-products",
				element: (
					<SellerRoute>
						<SellerMyProducts />
					</SellerRoute>
				),
			},
			{
				path: "add-product",
				element: (
					<SellerRoute>
						<SellerAddProduct />
					</SellerRoute>
				),
			},
			{
				path: "edit-product/:id",
				element: (
					<SellerRoute>
						<SellerAddProduct />
					</SellerRoute>
				),
			},
			{
				path: "requested-orders",
				element: (
					<SellerRoute>
						<SellerRequestedOrders />
					</SellerRoute>
				),
			},
			{
				path: "sales-analytics",
				element: (
					<SellerRoute>
						<SellerSalesAnalytics />
					</SellerRoute>
				),
			},

			// Agent Routes
			{
				path: "agent",
				element: (
					<AgentRoute>
						<AgentDashboard />
					</AgentRoute>
				),
			},
			{
				path: "verify-sellers",
				element: (
					<AgentRoute>
						<AgentVerifySellers />
					</AgentRoute>
				),
			},
			{
				path: "verify-products",
				element: (
					<AgentRoute>
						<AgentVerifyProducts />
					</AgentRoute>
				),
			},
			{
				path: "manage-deliveries",
				element: (
					<AgentRoute>
						<AgentManageDeliveries />
					</AgentRoute>
				),
			},
			{
				path: "warehouse-management",
				element: (
					<AgentRoute>
						<AgentWarehouseManagement />
					</AgentRoute>
				),
			},

			// Admin Routes
			{
				path: "analytics",
				element: (
					<AdminRoute>
						<AdminAnalytics />
					</AdminRoute>
				),
			},
			{
				path: "manage-products",
				element: (
					<AdminRoute>
						<AdminManageProducts />
					</AdminRoute>
				),
			},
			{
				path: "manage-orders",
				element: (
					<AdminRoute>
						<AdminManageOrders />
					</AdminRoute>
				),
			},
			{
				path: "manage-users",
				element: (
					<AdminRoute>
						<AdminManageUsers />
					</AdminRoute>
				),
			},
			{
				path: "manage-applications",
				element: (
					<AdminRoute>
						<AdminManageApplications />
					</AdminRoute>
				),
			},
			{
				path: "system-settings",
				element: (
					<AdminRoute>
						<SystemSettings />
					</AdminRoute>
				),
			},
			{
				path: "platform-analytics",
				element: (
					<AdminRoute>
						<AdminAnalytics />
					</AdminRoute>
				),
			},
		],
	},
]);

export default Router;
