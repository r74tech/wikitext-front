import type React from "react";
import { useEffect, useRef } from "react";
import { useEditor } from "../hooks/useEditor";
import { useAppSelector } from "../store/hooks";
import PageView from "./PageView";
import SideBar from "./SideBar";

const MainContent: React.FC = () => {
	const contentRef = useRef<HTMLDivElement>(null);
	const stylesRef = useRef<HTMLDivElement>(null);
	const { html, styles } = useAppSelector((state) => state.page);

	useEditor();

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
		<div id="content-wrap">
			<div id="side-bar">
				<SideBar />
			</div>
			<div id="main-content">
				<div id="action-area-top" />
				<PageView />
				<div id="page-styles" ref={stylesRef} style={{ display: "none" }} />
				<div id="page-content" ref={contentRef} style={{ display: "none" }} />
			</div>
		</div>
	);
};

export default MainContent;
