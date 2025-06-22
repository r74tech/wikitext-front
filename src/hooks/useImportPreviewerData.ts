import { useCallback, useEffect, useState } from "react";
import { createPage } from "../core/page";
import { type FtmlSource, type PageId, type PageTitle, ShortId } from "../core/shared";
import { IndexedDbPageRepository } from "../infra/indexedDbPageRepository";

const PREVIEWER_DB_NAME = "MyDatabase";
const PREVIEWER_STORE_NAME = "pages";

interface PreviewerPage {
    id: string;
    title: string;
    source: string;
    html: string;
    metadata: {
        tags: string[];
        parseTime: number;
    };
    createdAt: string;
    updatedAt: string;
    authorId: string;
    revisionCount: number;
}

export function useImportPreviewerData() {
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [importError, setImportError] = useState<string | null>(null);

    const importData = useCallback(async () => {
        setIsImporting(true);
        setImportError(null);
        setImportProgress(0);

        try {
            const request = indexedDB.open(PREVIEWER_DB_NAME);

            const db = await new Promise<IDBDatabase>((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            if (!db.objectStoreNames.contains(PREVIEWER_STORE_NAME)) {
                throw new Error("Previewer database not found");
            }

            const transaction = db.transaction([PREVIEWER_STORE_NAME], "readonly");
            const store = transaction.objectStore(PREVIEWER_STORE_NAME);
            const getAllRequest = store.getAll();

            const previewerPages = await new Promise<PreviewerPage[]>((resolve, reject) => {
                getAllRequest.onsuccess = () => resolve(getAllRequest.result || []);
                getAllRequest.onerror = () => reject(getAllRequest.error);
            });

            const repository = new IndexedDbPageRepository();
            await repository.initialize();

            let imported = 0;
            for (const previewerPage of previewerPages) {
                const page = createPage(
                    previewerPage.id as PageId,
                    previewerPage.title as PageTitle,
                    previewerPage.source as FtmlSource,
                    new Date(previewerPage.createdAt),
                );

                const pageWithDetails = {
                    ...page,
                    shortId: ShortId(previewerPage.id),
                    html: previewerPage.html,
                    styles: [],
                    updatedAt: new Date(previewerPage.updatedAt),
                    authorId: previewerPage.authorId,
                    revisionCount: previewerPage.revisionCount,
                };

                await repository.save(pageWithDetails);
                imported++;
                setImportProgress((imported / previewerPages.length) * 100);
            }

            db.close();
            setIsImporting(false);
            return imported;
        } catch (error) {
            setImportError(error instanceof Error ? error.message : "Unknown error");
            setIsImporting(false);
            throw error;
        }
    }, []);

    useEffect(() => {
        const checkAndImport = async () => {
            try {
                const importedFlag = localStorage.getItem("wikitext-previewer-imported");
                if (importedFlag === "true") {
                    return;
                }

                const databases = await indexedDB.databases();
                const hasPreviewerDb = databases.some((db) => db.name === PREVIEWER_DB_NAME);

                if (hasPreviewerDb) {
                    const count = await importData();
                    if (count > 0) {
                        localStorage.setItem("wikitext-previewer-imported", "true");
                    }
                }
            } catch {}
        };

        checkAndImport();
    }, [importData]);

    return {
        isImporting,
        importProgress,
        importError,
        importData,
    };
}
