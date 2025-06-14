import {
	FaCubes,
	FaCheck,
	FaExclamationTriangle,
	FaTimes,
	FaWarehouse,
	FaUsers,
	FaUserCheck,
	FaUserTimes,
} from "react-icons/fa";

const StatsCard = ({
	icon: Icon,
	title,
	value,
	color = "primary",
	trend = null,
}) => {
	const colorConfig = {
		primary: "text-primary-600",
		green: "text-green-600",
		yellow: "text-yellow-600",
		red: "text-red-600",
		gray: "text-gray-600",
		blue: "text-blue-600",
	};

	return (
		<div className="bg-white overflow-hidden shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
			<div className="flex items-center">
				<div className="flex-shrink-0">
					<div
						className={`p-3 rounded-full bg-${
							color === "primary" ? "primary" : color
						}-100`}
					>
						<Icon className={`h-6 w-6 ${colorConfig[color]}`} />
					</div>
				</div>
				<div className="ml-5 w-0 flex-1">
					<dl>
						<dt className="text-sm font-medium text-gray-500 truncate">
							{title}
						</dt>
						<dd className="flex items-center">
							<span className="text-3xl font-bold text-gray-900">
								{(value ?? 0).toLocaleString()}
							</span>
							{trend && (
								<span
									className={`ml-2 text-sm font-medium ${
										trend > 0
											? "text-green-600"
											: trend < 0
											? "text-red-600"
											: "text-gray-600"
									}`}
								>
									{trend > 0 ? "+" : ""}
									{trend}%
								</span>
							)}
						</dd>
					</dl>
				</div>
			</div>
		</div>
	);
};

export const ProductStatsCards = ({ stats = {} }) => {
	return (
		<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
			<StatsCard
				icon={FaCubes}
				title="Total Products"
				value={stats.total ?? 0}
				color="primary"
			/>
			<StatsCard
				icon={FaCheck}
				title="Approved"
				value={stats.approved ?? 0}
				color="green"
			/>
			<StatsCard
				icon={FaExclamationTriangle}
				title="Pending"
				value={stats.pending ?? 0}
				color="yellow"
			/>
			<StatsCard
				icon={FaTimes}
				title="Rejected"
				value={stats.rejected ?? 0}
				color="red"
			/>
			<StatsCard
				icon={FaWarehouse}
				title="Out of Stock"
				value={stats.outOfStock ?? 0}
				color="gray"
			/>
		</div>
	);
};

export const UserStatsCards = ({ stats = {} }) => {
	return (
		<div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-6">
			<StatsCard
				icon={FaUsers}
				title="Total Users"
				value={stats.total ?? 0}
				color="primary"
			/>
			<StatsCard
				icon={FaUserCheck}
				title="Active"
				value={stats.active ?? 0}
				color="green"
			/>
			<StatsCard
				icon={FaUserTimes}
				title="Inactive"
				value={stats.inactive ?? 0}
				color="red"
			/>
			<StatsCard
				icon={FaUserCheck}
				title="Agents"
				value={stats.agents ?? 0}
				color="blue"
			/>
			<StatsCard
				icon={FaUsers}
				title="Sellers"
				value={stats.sellers ?? 0}
				color="green"
			/>
			<StatsCard
				icon={FaUsers}
				title="Consumers"
				value={stats.consumers ?? 0}
				color="gray"
			/>
		</div>
	);
};
