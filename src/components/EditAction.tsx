import type React from "react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEditor } from "../hooks/useEditor";
import { useSavePage } from "../hooks/useSavePage";
import { useAppSelector } from "../store/hooks";

interface EditActionProps {
    onClose: () => void;
}

const EditAction: React.FC<EditActionProps> = ({ onClose }) => {
    const navigate = useNavigate();
    const { title, source, shortId } = useAppSelector((state) => state.page);
    const { updateTitle, updateSource } = useEditor();
    const { savePage } = useSavePage();
    const [isSaving, setIsSaving] = useState(false);

    const handleTitleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            updateTitle(e.target.value);
        },
        [updateTitle],
    );

    const handleSourceChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            updateSource(e.target.value);
        },
        [updateSource],
    );

    const handleSave = useCallback(
        async (e: React.MouseEvent) => {
            e.preventDefault();
            setIsSaving(true);

            try {
                const result = await savePage(title, source);

                if (result.isOk()) {
                    if (!shortId && result.value.shortId) {
                        const newShortId = result.value.shortId || result.value.id;
                        navigate(`/share/${newShortId}`);
                    } else {
                        onClose();
                    }
                } else {
                }
            } catch {
            } finally {
                setIsSaving(false);
            }
        },
        [title, source, shortId, savePage, navigate, onClose],
    );

    return (
        <>
            <h1>Edit the page</h1>
            <div>
                <form id="edit-page-form">
                    <table className="form">
                        <tbody>
                            <tr>
                                <td>Title of the page:</td>
                                <td>
                                    <input
                                        className="text"
                                        id="edit-page-title"
                                        type="text"
                                        value={title}
                                        onChange={handleTitleChange}
                                        size={35}
                                        maxLength={128}
                                        style={{ fontWeight: "bold", fontSize: "130%" }}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div>
                        <textarea
                            id="edit-page-textarea"
                            rows={20}
                            cols={60}
                            style={{ width: "95%" }}
                            value={source}
                            onChange={handleSourceChange}
                        />
                    </div>
                    <div className="buttons alignleft">
                        <input
                            type="button"
                            className="btn btn-danger"
                            value="Cancel"
                            onClick={onClose}
                        />
                        <input
                            type="button"
                            className="btn btn-primary"
                            value={isSaving ? "Saving..." : "Save"}
                            onClick={handleSave}
                            disabled={isSaving}
                        />
                    </div>
                </form>
            </div>
        </>
    );
};

export default EditAction;
