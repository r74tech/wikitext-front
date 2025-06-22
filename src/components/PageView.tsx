import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAutoSave } from "../hooks/useAutoSave";
import { useEditor } from "../hooks/useEditor";
import { useAppSelector } from "../store/hooks";
import EditAction from "./EditAction";
import PageSourceAction from "./PageSourceAction";

const PageView: React.FC = () => {
	const { title, html, styles, revisionCount } = useAppSelector((state) => state.page);
	useEditor();
	useAutoSave();
	const [actionMode, setActionMode] = useState<"none" | "edit" | "source">("none");
	const contentRef = useRef<HTMLDivElement>(null);
	const stylesRef = useRef<HTMLDivElement>(null);

	const handleEditClick = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		setActionMode("edit");
	}, []);

	const handleSourceClick = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		setActionMode("source");
	}, []);

	const handleCloseAction = useCallback(() => {
		setActionMode("none");
	}, []);

	useEffect(() => {
		if (contentRef.current) {
			contentRef.current.innerHTML = html;
		}
	}, [html]);

	useEffect(() => {
		if (stylesRef.current && styles) {
			const styleContent = styles.join("\n");
			stylesRef.current.innerHTML = `<style>${styleContent}</style>`;
		}
	}, [styles]);

	return (
		<>
			<div id="action-area-top" />

			<div id="page-title">{title || "Untitled"}</div>

			<div id="page-styles" ref={stylesRef} />
			<div id="page-content" ref={contentRef} />

			<div id="page-info-break" />

			<div id="page-options-container">
				<div id="page-info">
					page revision: {revisionCount}, last edited: {new Date().toLocaleString()}
				</div>
				<div id="page-options-bottom" className="page-options-bottom">
					<NavLink className="btn btn-default" id="edit-button" onClick={handleEditClick} to="#">
						Edit
					</NavLink>
					<NavLink
						className="btn btn-default"
						id="view-source-button"
						onClick={handleSourceClick}
						to="#"
					>
						Page Source
					</NavLink>
				</div>
				<div id="page-options-area-bottom" />
			</div>

			<div id="action-area" style={{ display: actionMode !== "none" ? "block" : "none" }}>
				{actionMode === "edit" && <EditAction onClose={handleCloseAction} />}
				{actionMode === "source" && <PageSourceAction onClose={handleCloseAction} />}
			</div>
		</>
	);
};

export default PageView;
