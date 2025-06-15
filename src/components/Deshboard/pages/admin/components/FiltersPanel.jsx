import { FaSearch, FaFilter, FaTimes, FaSpinner } from "react-icons/fa";

const FilterField = ({ label, icon: Icon, children }) => (
	<div className="space-y-2">
		<label className="block text-sm font-medium text-gray-700">
			{Icon && <Icon className="inline mr-2 h-4 w-4" />}
			{label}
		</label>
		{children}
	</div>
);

const BulkActions = ({
	selectedCount,
	onBulkAction,
	onClearSelection,
	actions = [],
}) => {
	if (selectedCount === 0) return null;

	return (
		<div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
			<div className="flex items-center justify-between">
				<div className="flex items-center">
					<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
						<span className="text-blue-600 font-semibold text-sm">
							{selectedCount}
						</span>
					</div>
					<span className="text-sm font-medium text-blue-800">
						{selectedCount} item{selectedCount > 1 ? "s" : ""} selected
					</span>
				</div>
				<div className="flex space-x-2">
					{actions.map((action, index) => (
						<button
							key={index}
							onClick={() => onBulkAction(action.value)}
							className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 ${action.className}`}
						>
							{action.icon && <action.icon className="inline mr-1 h-4 w-4" />}
							{action.label}
						</button>
					))}
					<button
						onClick={onClearSelection}
						className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all duration-200"
					>
						<FaTimes className="inline mr-1 h-4 w-4" />
						Clear
					</button>
				</div>
			</div>
		</div>
	);
};

export const ProductFiltersPanel = ({
	searchTerm,
	setSearchTerm,
	categoryFilter,
	setCategoryFilter,
	statusFilter,
	setStatusFilter,
	qualityFilter,
	setQualityFilter,
	pageSize,
	setPageSize,
	setCurrentPage,
	bulkSelected = [],
	onBulkAction,
	onClearBulkSelection,
	isLoading = false,
}) => {
	const bulkActions = [
		{
			value: "approve",
			label: "Approve",
			className: "bg-green-600 text-white hover:bg-green-700",
		},
		{
			value: "reject",
			label: "Reject",
			className: "bg-red-600 text-white hover:bg-red-700",
		},
		{
			value: "suspend",
			label: "Suspend",
			className: "bg-orange-600 text-white hover:bg-orange-700",
		},
	];

	return (
		<div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
				<FilterField label="Search Products" icon={FaSearch}>
					<div className="relative">
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => {
								setSearchTerm(e.target.value);
								setCurrentPage(1);
							}}
							placeholder="Search by title, description..."
							className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
						/>
						<div className="absolute inset-y-0 right-0 flex items-center pr-3">
							{isLoading && searchTerm ? (
								<FaSpinner className="h-4 w-4 text-gray-400 animate-spin" />
							) : searchTerm ? (
								<button
									onClick={() => {
										setSearchTerm("");
										setCurrentPage(1);
									}}
									className="text-gray-400 hover:text-gray-600"
								>
									<FaTimes className="h-4 w-4" />
								</button>
							) : (
								<FaSearch className="h-4 w-4 text-gray-400" />
							)}
						</div>
					</div>
				</FilterField>

				<FilterField label="Category" icon={FaFilter}>
					<select
						value={categoryFilter}
						onChange={(e) => {
							setCategoryFilter(e.target.value);
							setCurrentPage(1);
						}}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
					>
						<option value="all">All Categories</option>
						<option value="rice">🌾 Rice</option>
						<option value="vegetable">🥬 Vegetables</option>
						<option value="fruit">🍎 Fruits</option>
						<option value="wheat">🌾 Wheat</option>
						<option value="spices">🌶️ Spices</option>
						<option value="dairy">🥛 Dairy</option>
						<option value="fish">🐟 Fish</option>
						<option value="meat">🥩 Meat</option>
					</select>
				</FilterField>

				<FilterField label="Status">
					<select
						value={statusFilter}
						onChange={(e) => {
							setStatusFilter(e.target.value);
							setCurrentPage(1);
						}}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
					>
						<option value="all">All Status</option>
						<option value="approved">✅ Approved</option>
						<option value="pending">⏳ Pending</option>
						<option value="rejected">❌ Rejected</option>
						<option value="suspended">🚫 Suspended</option>
					</select>
				</FilterField>

				<FilterField label="Quality Grade">
					<select
						value={qualityFilter}
						onChange={(e) => {
							setQualityFilter(e.target.value);
							setCurrentPage(1);
						}}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
					>
						<option value="all">All Grades</option>
						<option value="A">🏆 Grade A</option>
						<option value="B">🥈 Grade B</option>
						<option value="C">🥉 Grade C</option>
						<option value="D">📦 Grade D</option>
					</select>
				</FilterField>

				<FilterField label="Items Per Page">
					<select
						value={pageSize}
						onChange={(e) => {
							setPageSize(Number(e.target.value));
							setCurrentPage(1);
						}}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
					>
						<option value={10}>10 per page</option>
						<option value={20}>20 per page</option>
						<option value={50}>50 per page</option>
						<option value={100}>100 per page</option>
					</select>
				</FilterField>
			</div>

			<BulkActions
				selectedCount={bulkSelected.length}
				onBulkAction={onBulkAction}
				onClearSelection={onClearBulkSelection}
				actions={bulkActions}
			/>
		</div>
	);
};

export const UserFiltersPanel = ({
	searchTerm,
	setSearchTerm,
	roleFilter,
	setRoleFilter,
	statusFilter,
	setStatusFilter,
	pageSize,
	setPageSize,
	setCurrentPage,
	bulkSelected = [],
	onBulkAction,
	onClearBulkSelection,
	isLoading = false,
}) => {
	const bulkActions = [
		{
			value: "activate",
			label: "Activate",
			className: "bg-green-600 text-white hover:bg-green-700",
		},
		{
			value: "suspend",
			label: "Suspend",
			className: "bg-red-600 text-white hover:bg-red-700",
		},
	];

	return (
		<div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<FilterField label="Search Users" icon={FaSearch}>
					<div className="relative">
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => {
								setSearchTerm(e.target.value);
								setCurrentPage(1);
							}}
							placeholder="Search by name, email, phone..."
							className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
						/>
						<div className="absolute inset-y-0 right-0 flex items-center pr-3">
							{isLoading && searchTerm ? (
								<FaSpinner className="h-4 w-4 text-gray-400 animate-spin" />
							) : searchTerm ? (
								<button
									onClick={() => {
										setSearchTerm("");
										setCurrentPage(1);
									}}
									className="text-gray-400 hover:text-gray-600"
								>
									<FaTimes className="h-4 w-4" />
								</button>
							) : (
								<FaSearch className="h-4 w-4 text-gray-400" />
							)}
						</div>
					</div>
				</FilterField>

				<FilterField label="Role" icon={FaFilter}>
					<select
						value={roleFilter}
						onChange={(e) => {
							setRoleFilter(e.target.value);
							setCurrentPage(1);
						}}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
					>
						<option value="all">All Roles</option>
						<option value="admin">👑 Admin</option>
						<option value="agent">🤝 Agent</option>
						<option value="seller">🌱 Seller</option>
						<option value="consumer">🛒 Consumer</option>
					</select>
				</FilterField>

				<FilterField label="Status">
					<select
						value={statusFilter}
						onChange={(e) => {
							setStatusFilter(e.target.value);
							setCurrentPage(1);
						}}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
					>
						<option value="all">All Status</option>
						<option value="active">✅ Active</option>
						<option value="inactive">❌ Inactive</option>
					</select>
				</FilterField>

				<FilterField label="Items Per Page">
					<select
						value={pageSize}
						onChange={(e) => {
							setPageSize(Number(e.target.value));
							setCurrentPage(1);
						}}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
					>
						<option value={10}>10 per page</option>
						<option value={20}>20 per page</option>
						<option value={50}>50 per page</option>
						<option value={100}>100 per page</option>
					</select>
				</FilterField>
			</div>

			<BulkActions
				selectedCount={bulkSelected.length}
				onBulkAction={onBulkAction}
				onClearSelection={onClearBulkSelection}
				actions={bulkActions}
			/>
		</div>
	);
};
