import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import useScrollToTop from "../hooks/useScrollToTop";

export default function NotFound() {
	useScrollToTop();

	return (
		<div className="min-h-screen flex flex-col bg-gray-50 pt-16 pb-12">
			<main className="flex-grow flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex-shrink-0 flex justify-center">
					<Link to="/" className="inline-flex">
						<span className="text-3xl font-display font-bold text-primary-600">
							SmartAgro
						</span>
						<span className="ml-1 text-3xl font-display font-bold text-gray-700">
							Connect
						</span>
					</Link>
				</div>
				<div className="py-16">
					<div className="text-center">
						<p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
							404 error
						</p>
						<h1 className="mt-2 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
							Page not found.
						</h1>
						<p className="mt-2 text-base text-gray-500">
							Sorry, we couldn't find the page you're looking for.
						</p>
						<div className="mt-6">
							<Link
								to="/"
								className="text-base font-medium text-primary-600 hover:text-primary-500 flex items-center justify-center"
							>
								<FaArrowLeft className="mr-1" />
								Go back home
							</Link>
						</div>
					</div>
				</div>
			</main>
			<footer className="flex-shrink-0 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
				<nav className="flex justify-center space-x-4">
					<Link
						to="/about"
						className="text-sm font-medium text-gray-500 hover:text-gray-600"
					>
						About
					</Link>
					<span
						className="inline-block border-l border-gray-300"
						aria-hidden="true"
					/>
					<Link
						to="/products"
						className="text-sm font-medium text-gray-500 hover:text-gray-600"
					>
						Products
					</Link>
					<span
						className="inline-block border-l border-gray-300"
						aria-hidden="true"
					/>
					<a
						href="mailto:support@smartagroconnect.com"
						className="text-sm font-medium text-gray-500 hover:text-gray-600"
					>
						Contact Support
					</a>
				</nav>
			</footer>
		</div>
	);
}
