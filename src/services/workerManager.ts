import type { WorkerRequest, WorkerResponse } from "../types/worker";
import FtmlWorker from "../workers/ftml.worker.ts?worker";

class WorkerManager {
    private static instance: WorkerManager | null = null;
    private worker: Worker | null = null;
    private listeners = new Map<string, (response: WorkerResponse) => void>();
    private initialized = false;
    private initPromise: Promise<void> | null = null;

    private constructor() {}

    static getInstance(): WorkerManager {
        if (!WorkerManager.instance) {
            WorkerManager.instance = new WorkerManager();
        }
        return WorkerManager.instance;
    }

    private async initialize(): Promise<void> {
        if (this.initialized) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise<void>((resolve, reject) => {
            try {
                this.worker = new FtmlWorker();

                this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
                    if (event.data.type === "initialized") {
                        this.initialized = true;
                        resolve();
                    }
                    for (const listener of this.listeners.values()) {
                        listener(event.data);
                    }
                };

                this.worker.onerror = () => {
                    reject(new Error("Worker error"));
                };

                const initRequest: WorkerRequest = { type: "init" };
                this.worker.postMessage(initRequest);
            } catch (error) {
                reject(error);
            }
        });

        return this.initPromise;
    }

    async postMessage(request: WorkerRequest): Promise<void> {
        await this.initialize();
        if (!this.worker) {
            throw new Error("Worker not initialized");
        }
        this.worker.postMessage(request);
    }

    subscribe(id: string, listener: (response: WorkerResponse) => void): () => void {
        this.listeners.set(id, listener);
        return () => {
            this.listeners.delete(id);
        };
    }

    terminate(): void {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
            this.initialized = false;
            this.initPromise = null;
            this.listeners.clear();
        }
    }
}

export const workerManager = WorkerManager.getInstance();
