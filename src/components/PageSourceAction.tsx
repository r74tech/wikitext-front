import type React from "react";
import { Fragment } from "react";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

interface PageSourceActionProps {
    onClose: () => void;
}

const PageSourceAction: React.FC<PageSourceActionProps> = ({ onClose }) => {
    const source = useAppSelector((state) => state.page.source);
    const selectedRevision = useAppSelector((state) => state.page.selectedRevision);
    const revisionSource = useAppSelector((state) => state.page.revisionSource);

    const displaySource = selectedRevision && revisionSource ? revisionSource : source;
    const title = selectedRevision
        ? `Page source Revision Number: ${selectedRevision}`
        : "Page source";

    return (
        <>
            <NavLink className="action-area-close btn btn-danger" onClick={onClose} to="#">
                <i className="icon-remove" /> Close
            </NavLink>
            <h1>{title}</h1>
            <div className="page-source">
                {displaySource.split("\n").map((line, index) => (
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
