import { useCallback, useEffect, useRef } from "react";
import { createPage, updatePageSource } from "../core/page";
import { FtmlSource, PageId, PageTitle, ShortId } from "../core/shared";
import { IndexedDbPageRepository } from "../infra/indexedDbPageRepository";
import { useAppSelector } from "../store/hooks";

export function useAutoSave() {
    const { title, source, shortId, revisionCount } = useAppSelector((state) => state.page);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const repositoryRef = useRef<IndexedDbPageRepository | null>(null);

    useEffect(() => {
        const initRepo = async () => {
            const repo = new IndexedDbPageRepository();
            await repo.initialize();
            repositoryRef.current = repo;
        };
        initRepo();
    }, []);

    const saveToIdb = useCallback(async () => {
        if (!repositoryRef.current || !source) return;

        try {
            const pageId = shortId || `draft-${Date.now()}`;

            const existingResult = await repositoryRef.current.findById(PageId(pageId));

            if (existingResult.isOk() && existingResult.value) {
                const updatedPage = {
                    ...updatePageSource(existingResult.value, FtmlSource(source), new Date()),
                    title: PageTitle(title),
                };
                await repositoryRef.current.save(updatedPage);
            } else {
                const newPage = createPage(
                    PageId(pageId),
                    PageTitle(title),
                    FtmlSource(source),
                    new Date(),
                );
                const pageWithDetails = {
                    ...newPage,
                    shortId: shortId ? ShortId(shortId) : undefined,
                    revisionCount,
                };
                await repositoryRef.current.save(pageWithDetails);
            }
        } catch {}
    }, [title, source, shortId, revisionCount]);

    useEffect(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            saveToIdb();
        }, 1000);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [saveToIdb]);

    return { saveToIdb };
}
