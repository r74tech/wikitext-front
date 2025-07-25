import { useCallback, useState } from "react";
import type { ParseResult } from "../core/page";

export function useRevisionPreview() {
    const [revisionPreview, setRevisionPreview] = useState<ParseResult | null>(null);

    const setPreview = useCallback((parseResult: ParseResult | null) => {
        setRevisionPreview(parseResult);
    }, []);

    const clearPreview = useCallback(() => {
        setRevisionPreview(null);
    }, []);

    return {
        revisionPreview,
        setPreview,
        clearPreview,
    };
}
