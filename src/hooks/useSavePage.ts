import { nanoid } from "nanoid";
import { err, type Result } from "neverthrow";
import { useCallback } from "react";
import { PageService } from "../app/pageService";
import { API_BASE_URL } from "../config/api";
import type { Page } from "../core/page";
import type { FtmlSource, PageId, PageTitle } from "../core/shared";
import { createFtmlService } from "../infra/ftmlService";
import { HybridPageRepository } from "../infra/hybridPageRepository";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setRevisionCount, setSaving, setShortId } from "../store/pageSlice";
import FtmlWorker from "../workers/ftml.worker.ts?worker";

export function useSavePage() {
    const dispatch = useAppDispatch();
    const { shortId } = useAppSelector((state) => state.page);
    const userId = useAppSelector((state) => state.user.userId);

    const savePage = useCallback(
        async (title: string, source: string): Promise<Result<Page, Error>> => {
            dispatch(setSaving(true));

            try {
                const ftmlServiceResult = await createFtmlService(FtmlWorker);
                if (ftmlServiceResult.isErr()) {
                    dispatch(setSaving(false));
                    return err(ftmlServiceResult.error);
                }

                const repository = new HybridPageRepository(API_BASE_URL, userId);
                const pageService = new PageService(ftmlServiceResult.value, repository);

                let result: Result<Page, Error>;

                if (shortId) {
                    result = await pageService.updatePageContent(
                        shortId as PageId,
                        title as PageTitle,
                        source as FtmlSource,
                    );
                } else {
                    const tempId = `new-${nanoid(10)}`;
                    result = await pageService.createNewPage(
                        tempId as PageId,
                        title as PageTitle,
                        source as FtmlSource,
                    );

                    if (result.isOk() && result.value.shortId) {
                        const shortIdValue =
                            typeof result.value.shortId === "string"
                                ? result.value.shortId
                                : (result.value.shortId as string);
                        dispatch(setShortId(shortIdValue));
                    }
                }

                if (result.isOk()) {
                    dispatch(setRevisionCount(result.value.revisionCount));
                } else {
                }

                dispatch(setSaving(false));
                return result;
            } catch (error) {
                dispatch(setSaving(false));
                throw error;
            }
        },
        [dispatch, shortId, userId],
    );

    return { savePage };
}
