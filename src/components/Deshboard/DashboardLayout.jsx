import { useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

export default function DashboardLayout() {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="h-screen flex overflow-hidden bg-gray-100">
			{/* Sidebar */}
			<DashboardSidebar
				sidebarOpen={sidebarOpen}
				setSidebarOpen={setSidebarOpen}
			/>

			{/* Main content */}
			<div className="flex flex-col w-0 flex-1 overflow-hidden">
				{/* Header */}
				<DashboardHeader setSidebarOpen={setSidebarOpen} />

				{/* Main content area */}
				<main className="flex-1 relative overflow-y-auto focus:outline-none">
					<div className="p-4 sm:p-6 md:p-8">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	);
}
