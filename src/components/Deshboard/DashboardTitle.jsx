import React from "react";
import PropTypes from "prop-types";

/**
 * Component for consistent dashboard section titles
 * @param {Object} props - Component props
 * @param {string} props.title - The title text to display
 * @param {React.ReactNode} [props.children] - Optional content to display next to the title
 */
export default function DashboardTitle({ title, children }) {
	return (
		<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
			<h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
			{children && <div className="mt-2 md:mt-0">{children}</div>}
		</div>
	);
}

DashboardTitle.propTypes = {
	title: PropTypes.string.isRequired,
	children: PropTypes.node,
};
