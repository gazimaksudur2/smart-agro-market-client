import AgentApplication from "../components/Applications/AgentApplication";
import useApplicationAuth from "../hooks/useApplicationAuth";
import useScrollToTop from "../hooks/useScrollToTop";

export default function AgentApplicationPage() {
	useScrollToTop(false); // Instant scroll at page level
	const { loading, isAuthenticated } = useApplicationAuth();

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null; // Will redirect to login
	}

	return <AgentApplication />;
}
