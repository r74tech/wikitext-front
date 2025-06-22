import type React from "react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEditor } from "../hooks/useEditor";
import { useSavePage } from "../hooks/useSavePage";
import { useAppSelector } from "../store/hooks";

const EditForm: React.FC = () => {
	const navigate = useNavigate();
	const { isSaving } = useAppSelector((state) => state.page);
	const { source, title, updateSource, updateTitle } = useEditor();
	const { savePage } = useSavePage();
	const [saveError, setSaveError] = useState<string | null>(null);

	const handleSourceChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			updateSource(e.target.value);
		},
		[updateSource],
	);

	const handleTitleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			updateTitle(e.target.value);
		},
		[updateTitle],
	);

	const handleSave = useCallback(async () => {
		setSaveError(null);
		try {
			const result = await savePage(title, source);

			if (result.isOk()) {
				const shortId = result.value.shortId || result.value.id;
				navigate(`/share/${shortId}`);
			} else {
				setSaveError(result.error.message);
			}
		} catch (error) {
			setSaveError(error instanceof Error ? error.message : "Unknown error");
		}
	}, [title, source, savePage, navigate]);

	return (
		<div className="edit-form">
			{isSaving && (
				<div className="saving-overlay">
					<div className="saving-message">{isSaving ? "Saving..." : "Processing..."}</div>
				</div>
			)}

			<div className="edit-form-header">
				<label htmlFor="page-title">Page Title:</label>
				<input
					id="page-title"
					type="text"
					value={title}
					onChange={handleTitleChange}
					placeholder="Enter page title..."
					className="title-input"
				/>
			</div>

			<div className="edit-form-body">
				<label htmlFor="page-source">Page Source:</label>
				<textarea
					id="page-source"
					value={source}
					onChange={handleSourceChange}
					placeholder="Enter wikitext here..."
					className="source-textarea"
					rows={20}
				/>
			</div>

			<div className="edit-form-footer">
				<button disabled={isSaving} type="button" onClick={handleSave}>
					Save Page
				</button>
				{saveError && (
					<div className="error-message" style={{ color: "red", marginTop: "10px" }}>
						Error: {saveError}
					</div>
				)}
			</div>
		</div>
	);
};

export default EditForm;
