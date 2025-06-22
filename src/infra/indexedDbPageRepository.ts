import { err, ok, type Result } from "neverthrow";
import type { PageRepository } from "../app/pageService";
import type { Page } from "../core/page";
import type { PageId } from "../core/shared";

const DB_NAME = "wikitext-pages";
const DB_VERSION = 1;
const STORE_NAME = "pages";

export class IndexedDbPageRepository implements PageRepository {
    private db: IDBDatabase | null = null;

    private ensureDb(): Result<IDBDatabase, Error> {
        if (!this.db) {
            return err(new Error("Database not initialized"));
        }
        return ok(this.db);
    }

    async initialize(): Promise<Result<void, Error>> {
        try {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            return new Promise((resolve) => {
                request.onerror = () => {
                    resolve(err(new Error("Failed to open IndexedDB")));
                };

                request.onsuccess = () => {
                    this.db = request.result;
                    resolve(ok(undefined));
                };

                request.onupgradeneeded = (event) => {
                    const db = (event.target as IDBOpenDBRequest).result;

                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
                        store.createIndex("shortId", "shortId", { unique: true });
                        store.createIndex("updatedAt", "updatedAt", { unique: false });
                    }
                };
            });
        } catch (error) {
            return err(error as Error);
        }
    }

    async findById(id: PageId): Promise<Result<Page | null, Error>> {
        if (!this.db) {
            const initResult = await this.initialize();
            if (initResult.isErr()) return err(initResult.error);
        }

        const dbResult = this.ensureDb();
        if (dbResult.isErr()) return err(dbResult.error);

        try {
            const transaction = dbResult.value.transaction([STORE_NAME], "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            return new Promise((resolve) => {
                request.onsuccess = () => {
                    resolve(ok(request.result || null));
                };

                request.onerror = () => {
                    resolve(err(new Error("Failed to read from IndexedDB")));
                };
            });
        } catch (error) {
            return err(error as Error);
        }
    }

    async save(page: Page): Promise<Result<Page, Error>> {
        if (!this.db) {
            const initResult = await this.initialize();
            if (initResult.isErr()) return err(initResult.error);
        }

        const dbResult = this.ensureDb();
        if (dbResult.isErr()) return err(dbResult.error);

        try {
            const transaction = dbResult.value.transaction([STORE_NAME], "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(page);

            return new Promise((resolve) => {
                request.onsuccess = () => {
                    resolve(ok(page));
                };

                request.onerror = () => {
                    resolve(err(new Error("Failed to save to IndexedDB")));
                };
            });
        } catch (error) {
            return err(error as Error);
        }
    }

    async findByShortId(shortId: string): Promise<Result<Page | null, Error>> {
        if (!this.db) {
            const initResult = await this.initialize();
            if (initResult.isErr()) return err(initResult.error);
        }

        const dbResult = this.ensureDb();
        if (dbResult.isErr()) return err(dbResult.error);

        try {
            const transaction = dbResult.value.transaction([STORE_NAME], "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index("shortId");
            const request = index.get(shortId);

            return new Promise((resolve) => {
                request.onsuccess = () => {
                    resolve(ok(request.result || null));
                };

                request.onerror = () => {
                    resolve(err(new Error("Failed to read from IndexedDB")));
                };
            });
        } catch (error) {
            return err(error as Error);
        }
    }

    async getAll(): Promise<Result<Page[], Error>> {
        if (!this.db) {
            const initResult = await this.initialize();
            if (initResult.isErr()) return err(initResult.error);
        }

        const dbResult = this.ensureDb();
        if (dbResult.isErr()) return err(dbResult.error);

        try {
            const transaction = dbResult.value.transaction([STORE_NAME], "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            return new Promise((resolve) => {
                request.onsuccess = () => {
                    resolve(ok(request.result || []));
                };

                request.onerror = () => {
                    resolve(err(new Error("Failed to read all from IndexedDB")));
                };
            });
        } catch (error) {
            return err(error as Error);
        }
    }

    async deleteById(id: PageId): Promise<Result<void, Error>> {
        if (!this.db) {
            const initResult = await this.initialize();
            if (initResult.isErr()) return err(initResult.error);
        }

        const dbResult = this.ensureDb();
        if (dbResult.isErr()) return err(dbResult.error);

        try {
            const transaction = dbResult.value.transaction([STORE_NAME], "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            return new Promise((resolve) => {
                request.onsuccess = () => {
                    resolve(ok(undefined));
                };

                request.onerror = () => {
                    resolve(err(new Error("Failed to delete from IndexedDB")));
                };
            });
        } catch (error) {
            return err(error as Error);
        }
    }
}
