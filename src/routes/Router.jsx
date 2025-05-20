import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import MainLayout from "../layouts/MainLayout";
import About from "../pages/About";
import Products from "../pages/Products";
import ProductDetails from "../pages/ProductDetails";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import DashboardLayout from "../layouts/DashboardLayout";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import AgentRoute from "./AgentRoute";
import SellerRoute from "./SellerRoute";

// Admin Dashboard Pages
import AdminDashboard from "../pages/Dashboard/Admin/AdminDashboard";
import ManageAgents from "../pages/Dashboard/Admin/ManageAgents";
import ManageUsers from "../pages/Dashboard/Admin/ManageUsers";
import Analytics from "../pages/Dashboard/Admin/Analytics";

// Agent Dashboard Pages
import AgentDashboard from "../pages/Dashboard/Agent/AgentDashboard";
import VerifySellers from "../pages/Dashboard/Agent/VerifySellers";
import VerifyProducts from "../pages/Dashboard/Agent/VerifyProducts";
import ManageDeliveries from "../pages/Dashboard/Agent/ManageDeliveries";

// Seller Dashboard Pages
import SellerDashboard from "../pages/Dashboard/Seller/SellerDashboard";
import AddProduct from "../pages/Dashboard/Seller/AddProduct";
import MyProducts from "../pages/Dashboard/Seller/MyProducts";
import SellerOrders from "../pages/Dashboard/Seller/SellerOrders";

// Consumer Dashboard Pages
import ConsumerDashboard from "../pages/Dashboard/Consumer/ConsumerDashboard";
import MyPurchases from "../pages/Dashboard/Consumer/MyPurchases";
import NotFound from "../pages/NotFound";

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
				path: "/login",
				element: <Login />,
			},
			{
				path: "/register",
				element: <Register />,
			},
		]
	},
	{
		path: "/dashboard",
		element: <PrivateRoute><DashboardLayout /></PrivateRoute>,
		children: [
			// Admin Routes
			{
				path: "admin",
				element: (
					<AdminRoute>
						<AdminDashboard />
					</AdminRoute>
				),
			},
			{
				path: "admin/agents",
				element: (
					<AdminRoute>
						<ManageAgents />
					</AdminRoute>
				),
			},
			{
				path: "admin/users",
				element: (
					<AdminRoute>
						<ManageUsers />
					</AdminRoute>
				),
			},
			{
				path: "admin/analytics",
				element: (
					<AdminRoute>
						<Analytics />
					</AdminRoute>
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
				path: "agent/verify-sellers",
				element: (
					<AgentRoute>
						<VerifySellers />
					</AgentRoute>
				),
			},
			{
				path: "agent/verify-products",
				element: (
					<AgentRoute>
						<VerifyProducts />
					</AgentRoute>
				),
			},
			{
				path: "agent/deliveries",
				element: (
					<AgentRoute>
						<ManageDeliveries />
					</AgentRoute>
				),
			},
			// Seller Routes
			{
				path: "seller",
				element: (
					<SellerRoute>
						<SellerDashboard />
					</SellerRoute>
				),
			},
			{
				path: "seller/add-product",
				element: (
					<SellerRoute>
						<AddProduct />
					</SellerRoute>
				),
			},
			{
				path: "seller/my-products",
				element: (
					<SellerRoute>
						<MyProducts />
					</SellerRoute>
				),
			},
			{
				path: "seller/my-orders",
				element: (
					<SellerRoute>
						<SellerOrders />
					</SellerRoute>
				),
			},
			// Consumer Routes
			{
				path: "consumer",
				element: <ConsumerDashboard />,
			},
			{
				path: "consumer/purchases",
				element: <MyPurchases />,
			},
		]
	}
]);

export default Router;

