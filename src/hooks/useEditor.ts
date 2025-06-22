import { useCallback, useEffect, useRef } from "react";
import type { FtmlSource } from "../core/shared";
import { workerManager } from "../services/workerManager";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setHtml, setSaving, setSource, setTitle } from "../store/pageSlice";
import type { WorkerRequest, WorkerResponse } from "../types/worker";

export function useEditor() {
    const dispatch = useAppDispatch();
    const { source, title, isSaving, shortId } = useAppSelector((state) => state.page);
    const previousSourceRef = useRef<string>("");
    const previousShortIdRef = useRef<string>("");
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleWorkerMessage = (response: WorkerResponse) => {
            if (response.type === "parsed") {
                dispatch(setSaving(false));

                dispatch(
                    setHtml({
                        html: response.result.html,
                        styles: response.result.styles,
                    }),
                );
            } else if (response.type === "error") {
                dispatch(setSaving(false));
            }
        };

        const unsubscribe = workerManager.subscribe("editor", handleWorkerMessage);

        return () => {
            unsubscribe();
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [dispatch]);

    const updateSource = useCallback(
        (newSource: string) => {
            dispatch(setSource(newSource));
            dispatch(setSaving(true));

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                const request: WorkerRequest = {
                    type: "parse",
                    id: `parse-${Date.now()}`,
                    source: newSource as FtmlSource,
                };
                workerManager.postMessage(request);
            }, 300);
        },
        [dispatch],
    );

    const updateTitle = useCallback(
        (newTitle: string) => {
            dispatch(setTitle(newTitle));
        },
        [dispatch],
    );

    useEffect(() => {
        if (shortId !== previousShortIdRef.current) {
            previousSourceRef.current = "";
            previousShortIdRef.current = shortId;
        }

        if (source && source !== previousSourceRef.current) {
            previousSourceRef.current = source;
            dispatch(setSaving(true));

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                const request: WorkerRequest = {
                    type: "parse",
                    id: `parse-${Date.now()}`,
                    source: source as FtmlSource,
                };
                workerManager.postMessage(request);
            }, 300);
        }
    }, [source, shortId, dispatch]);

    return {
        source,
        title,
        isSaving,
        updateSource,
        updateTitle,
    };
}
