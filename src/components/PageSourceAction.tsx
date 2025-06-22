import type React from "react";
import { Fragment } from "react";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

interface PageSourceActionProps {
	onClose: () => void;
}

const PageSourceAction: React.FC<PageSourceActionProps> = ({ onClose }) => {
	const source = useAppSelector((state) => state.page.source);

	return (
		<>
			<NavLink className="action-area-close btn btn-danger" onClick={onClose} to="#">
				<i className="icon-remove" /> Close
			</NavLink>
			<h1>Page source</h1>
			<div className="page-source">
				{source.split("\n").map((line, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: Line numbers are stable for source display
					<Fragment key={`line-${index}`}>
						{line}
						<br />
					</Fragment>
				))}
			</div>
		</>
	);
};

export default PageSourceAction;
