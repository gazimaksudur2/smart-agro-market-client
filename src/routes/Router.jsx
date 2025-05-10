import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import MainLayout from "../layouts/MainLayout";
import About from "../pages/About";
import Products from "../pages/Products";
import ProductDetails from "../pages/ProductDetails";
import Login from "../pages/Login";
import Register from "../pages/Register";
import DashboardLayout from "../layouts/DashboardLayout";
import RoleRoute from "./RoleRoute";

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
				path: "/products/:id",
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
			{
				index: true,
				element: <Dashboard />,
			},
			{
				path: "/dashboard/profile",
				element: <Profile />,
			},
			{
				path: "/dashboard/my-orders",
				element: <RoleRoute allowedRoles={["consumer"]}><MyOrders /></RoleRoute>,
			},
			{
				path: "my-products",
				element: <RoleRoute allowedRoles={["seller"]}><MyProducts /></RoleRoute>,
			},
			{
				path: "add-product",
				element: <RoleRoute allowedRoles={["seller"]}><AddProduct /></RoleRoute>,
			},
			{
				path: "agent",
				element: <RoleRoute allowedRoles={["agent"]}><AgentDashboard /></RoleRoute>,
			},
			{
				path: "agent-application",
				element: <RoleRoute allowedRoles={["seller"]}><AgentApplication /></RoleRoute>,
			},
			{
				path: "admin",
				element: <RoleRoute allowedRoles={["admin"]}><AdminDashboard /></RoleRoute>,
			}
		]
	}
]);

export default Router;
