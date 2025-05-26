import React from "react";
import { FaExclamationTriangle, FaHome, FaRedo } from "react-icons/fa";

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null, errorInfo: null };
	}

	static getDerivedStateFromError(error) {
		// Update state so the next render will show the fallback UI
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
		// Log the error to console and potentially to an error reporting service
		console.error("ErrorBoundary caught an error:", error, errorInfo);

		this.setState({
			error: error,
			errorInfo: errorInfo,
		});

		// You can also log the error to an error reporting service here
		// logErrorToService(error, errorInfo);
	}

	handleRefresh = () => {
		// Clear error state and reload the page
		this.setState({ hasError: false, error: null, errorInfo: null });
		window.location.reload();
	};

	handleGoHome = () => {
		// Clear error state and navigate to home
		this.setState({ hasError: false, error: null, errorInfo: null });
		window.location.href = "/";
	};

	render() {
		if (this.state.hasError) {
			// Fallback UI
			return (
				<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
					<div className="sm:mx-auto sm:w-full sm:max-w-md">
						<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
							<div className="text-center">
								<FaExclamationTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
								<h2 className="text-2xl font-bold text-gray-900 mb-2">
									Oops! Something went wrong
								</h2>
								<p className="text-gray-600 mb-6">
									We encountered an unexpected error. This might be a temporary
									issue.
								</p>

								{/* Error details for development */}
								{process.env.NODE_ENV === "development" && this.state.error && (
									<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
										<h3 className="text-sm font-medium text-red-800 mb-2">
											Error Details (Development Mode):
										</h3>
										<pre className="text-xs text-red-700 overflow-auto">
											{this.state.error.toString()}
											{this.state.errorInfo.componentStack}
										</pre>
									</div>
								)}

								<div className="space-y-3">
									<button
										onClick={this.handleRefresh}
										className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
									>
										<FaRedo className="mr-2 h-4 w-4" />
										Try Again
									</button>
									<button
										onClick={this.handleGoHome}
										className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
									>
										<FaHome className="mr-2 h-4 w-4" />
										Go to Homepage
									</button>
								</div>

								<div className="mt-6 text-center">
									<p className="text-sm text-gray-500">
										If this problem persists, please{" "}
										<a
											href="/contact"
											className="text-primary-600 hover:text-primary-500"
										>
											contact support
										</a>
										.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
