import { useCallback } from "react";
import type { HistoryItem } from "../components/HistoryAction";
import { FtmlSource as createFtmlSource, ShortId as createShortId } from "../core/shared";
import { createFtmlService } from "../infra/ftmlService";
import { useAppDispatch } from "../store/hooks";
import { setHistory, setRevisionSource, setSelectedRevision } from "../store/pageSlice";
import FtmlWorker from "../workers/ftml.worker.ts?worker";
import { useApiClient } from "./useApiClient";

export function usePageHistory(shortId: string | undefined) {
    const dispatch = useAppDispatch();
    const apiClient = useApiClient();

    const loadHistory = useCallback(async () => {
        if (shortId && apiClient) {
            const result = await apiClient.getPageHistory(createShortId(shortId));
            if (result.isOk()) {
                const historyItems: HistoryItem[] = result.value.map((item) => ({
                    revision: item.revisionCount,
                    flags: "S",
                    actions: "V S",
                    by: item.createdBy,
                    date: new Date(item.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    }),
                    comment: "",
                }));
                dispatch(setHistory(historyItems));
            }
        }
    }, [shortId, apiClient, dispatch]);

    const selectRevision = useCallback(
        async (revision: number, mode: "view" | "source") => {
            if (shortId && apiClient) {
                const result = await apiClient.getPageRevision(createShortId(shortId), revision);
                if (result.isOk()) {
                    dispatch(setSelectedRevision(revision));
                    dispatch(setRevisionSource(result.value.source));

                    if (mode === "view") {
                        const ftmlServiceResult = await createFtmlService(FtmlWorker);
                        if (ftmlServiceResult.isOk()) {
                            const ftmlService = ftmlServiceResult.value;
                            const parseResult = await ftmlService.parse(
                                createFtmlSource(result.value.source),
                            );
                            ftmlService.terminate();
                            return parseResult;
                        }
                    }
                }
            }
            return null;
        },
        [shortId, apiClient, dispatch],
    );

    const clearRevisionSelection = useCallback(() => {
        dispatch(setSelectedRevision(undefined));
        dispatch(setRevisionSource(undefined));
    }, [dispatch]);

    return {
        loadHistory,
        selectRevision,
        clearRevisionSelection,
    };
}
