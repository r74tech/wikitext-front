import type React from "react";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

interface HistoryActionProps {
    onClose: () => void;
    onRevisionSelect: (revision: number, mode: "view" | "source") => void;
}

export interface HistoryItem {
    revision: number;
    flags: string;
    actions: string;
    by: string;
    date: string;
    comment?: string;
}

const HistoryAction: React.FC<HistoryActionProps> = ({ onClose, onRevisionSelect }) => {
    const history = useAppSelector((state) => state.page.history);
    const selectedRevision = useAppSelector((state) => state.page.selectedRevision);
    const revisionSource = useAppSelector((state) => state.page.revisionSource);

    const handleViewClick = (revision: number) => {
        onRevisionSelect(revision, "view");
    };

    const handleSourceClick = (revision: number) => {
        onRevisionSelect(revision, "source");
    };

    return (
        <>
            <NavLink className="action-area-close btn btn-danger" onClick={onClose} to="#">
                <i className="icon-remove" /> Close
            </NavLink>
            <h1>History</h1>
            <div className="history-list">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>rev.</th>
                            <th>flags</th>
                            <th>actions</th>
                            <th>by</th>
                            <th>date</th>
                            <th>comment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history?.map((item) => (
                            <tr key={item.revision}>
                                <td>{item.revision}.</td>
                                <td>{item.flags}</td>
                                <td>
                                    <NavLink to="#" onClick={() => handleViewClick(item.revision)}>
                                        V
                                    </NavLink>{" "}
                                    <NavLink
                                        to="#"
                                        onClick={() => handleSourceClick(item.revision)}
                                    >
                                        S
                                    </NavLink>
                                </td>
                                <td>{item.by}</td>
                                <td>{item.date}</td>
                                <td>{item.comment}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {selectedRevision !== undefined && revisionSource && (
                <>
                    <h2>Page source Revision Number: {selectedRevision}</h2>
                    <div className="page-source">
                        {revisionSource.split("\n").map((line, index) => (
                            // biome-ignore lint/suspicious/noArrayIndexKey: Line numbers are stable for source display
                            <span key={`line-${index}`}>
                                {line}
                                <br />
                            </span>
                        ))}
                    </div>
                </>
            )}
        </>
    );
};

export default HistoryAction;
