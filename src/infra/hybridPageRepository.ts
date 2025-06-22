import { err, ok, type Result } from "neverthrow";
import type { PageRepository } from "../app/pageService";
import type { Page } from "../core/page";
import type { PageId } from "../core/shared";
import {
    FtmlSource as createFtmlSource,
    PageId as createPageId,
    PageTitle as createPageTitle,
    ShortId as createShortId,
} from "../core/shared";
import { ApiClient, type ClientPageData } from "./apiClient";
import { IndexedDbPageRepository } from "./indexedDbPageRepository";

export class HybridPageRepository implements PageRepository {
    private localRepo: IndexedDbPageRepository;
    private apiClient: ApiClient;
    private userId: string;

    constructor(apiBaseUrl: string, userId: string = "anonymous") {
        this.localRepo = new IndexedDbPageRepository();
        this.apiClient = new ApiClient(apiBaseUrl);
        this.userId = userId;
    }

    private mapApiDataToPage(data: ClientPageData): Page {
        return {
            id: createPageId(data.shortId),
            shortId: createShortId(data.shortId),
            title: createPageTitle(data.title),
            source: createFtmlSource(data.source),
            status: { type: "draft" },
            createdAt: new Date(data.updatedAt),
            updatedAt: new Date(data.updatedAt),
            revisionCount: data.revisionCount || 0,
        };
    }

    async findById(id: PageId): Promise<Result<Page | null, Error>> {
        const localResult = await this.localRepo.findById(id);
        if (localResult.isOk() && localResult.value) {
            return localResult;
        }

        if (id.startsWith("new-")) {
            return ok(null);
        }

        return this.findByShortId(id);
    }

    async findByShortId(shortId: string): Promise<Result<Page | null, Error>> {
        const apiResult = await this.apiClient.getPage(createShortId(shortId));

        if (apiResult.isOk()) {
            const page = this.mapApiDataToPage(apiResult.value);

            await this.localRepo.save(page);

            return ok(page);
        }

        const localResult = await this.localRepo.findByShortId(shortId);

        if (localResult.isOk() && localResult.value) {
            return localResult;
        }

        return err(apiResult.error);
    }

    async save(page: Page): Promise<Result<Page, Error>> {
        const localSaveResult = await this.localRepo.save(page);
        if (localSaveResult.isErr()) {
            return err(localSaveResult.error);
        }

        if (page.shortId) {
            const apiResult = await this.apiClient.updatePage(
                page.shortId,
                page.title,
                page.source,
                this.userId,
            );

            if (apiResult.isErr()) {
                return ok(page);
            }

            const updatedPage = this.mapApiDataToPage(apiResult.value);
            await this.localRepo.save(updatedPage);
            return ok(updatedPage);
        } else {
            const apiResult = await this.apiClient.createPage(page.title, page.source, this.userId);

            if (apiResult.isOk()) {
                const newPage = this.mapApiDataToPage(apiResult.value);
                await this.localRepo.save(newPage);
                return ok(newPage);
            } else {
                return ok(page);
            }
        }
    }

    async deleteById(id: PageId): Promise<Result<void, Error>> {
        return this.localRepo.deleteById(id);
    }

    async getAllPages(): Promise<Result<Page[], Error>> {
        return this.localRepo.getAll();
    }

    async syncWithApi(): Promise<Result<number, Error>> {
        try {
            const localPagesResult = await this.localRepo.getAll();
            if (localPagesResult.isErr()) {
                return err(localPagesResult.error);
            }

            let syncCount = 0;
            const errors: Error[] = [];

            for (const page of localPagesResult.value) {
                if (!page.shortId) continue;

                const apiResult = await this.apiClient.getPage(page.shortId);

                if (apiResult.isOk()) {
                    const apiPage = this.mapApiDataToPage(apiResult.value);

                    if (apiPage.updatedAt > page.updatedAt) {
                        await this.localRepo.save(apiPage);
                        syncCount++;
                    }
                } else {
                    errors.push(apiResult.error);
                }
            }

            if (errors.length > 0) {
            }

            return ok(syncCount);
        } catch (error) {
            return err(error instanceof Error ? error : new Error("Sync failed"));
        }
    }

    async checkApiHealth(): Promise<boolean> {
        const result = await this.apiClient.checkHealth();
        return result.isOk() && result.value;
    }
}
