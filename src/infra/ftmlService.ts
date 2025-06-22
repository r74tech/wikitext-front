import { err, ok, type Result } from "neverthrow";
import type { ParseResult } from "../core/page";
import type { FtmlSource } from "../core/shared";
import type { FtmlWorkerAPI, WorkerRequest, WorkerResponse } from "../types/worker";

export class FtmlService implements FtmlWorkerAPI {
	private worker: Worker | null = null;
	private pendingRequests = new Map<
		string,
		{
			resolve: (result: ParseResult) => void;
			reject: (error: Error) => void;
		}
	>();
	private initPromise: Promise<void> | null = null;
	private requestId = 0;

	constructor(private WorkerConstructor: new () => Worker) {}

	private async initialize(): Promise<void> {
		if (this.initPromise) return this.initPromise;

		this.initPromise = new Promise((resolve, reject) => {
			try {
				this.worker = new this.WorkerConstructor();

				this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
					this.handleWorkerMessage(event.data);
				};

				this.worker.onerror = (error) => {
					this.handleWorkerError(error);
				};

				const initRequest: WorkerRequest = { type: "init" };
				this.worker.postMessage(initRequest);

				const initHandler = (event: MessageEvent<WorkerResponse>) => {
					if (event.data.type === "initialized") {
						this.worker?.removeEventListener("message", initHandler);
						resolve();
					}
				};

				this.worker.addEventListener("message", initHandler);

				setTimeout(() => {
					reject(new Error("Worker initialization timeout"));
				}, 5000);
			} catch (error) {
				reject(error);
			}
		});

		return this.initPromise;
	}

	private handleWorkerMessage(response: WorkerResponse): void {
		switch (response.type) {
			case "parsed": {
				const pending = this.pendingRequests.get(response.id);
				if (pending) {
					pending.resolve(response.result);
					this.pendingRequests.delete(response.id);
				}
				break;
			}
			case "error": {
				const pending = this.pendingRequests.get(response.id);
				if (pending) {
					pending.reject(new Error(response.error));
					this.pendingRequests.delete(response.id);
				}
				break;
			}
		}
	}

	private handleWorkerError(error: ErrorEvent): void {
		for (const { reject } of this.pendingRequests.values()) {
			reject(new Error(`Worker error: ${error.message}`));
		}
		this.pendingRequests.clear();
	}

	async parse(source: FtmlSource): Promise<ParseResult> {
		await this.initialize();

		if (!this.worker) {
			throw new Error("Worker not initialized");
		}

		const id = `request-${this.requestId++}`;

		return new Promise((resolve, reject) => {
			this.pendingRequests.set(id, { resolve, reject });

			const request: WorkerRequest = {
				type: "parse",
				id,
				source,
			};

			if (this.worker) {
				this.worker.postMessage(request);
			}

			setTimeout(() => {
				if (this.pendingRequests.has(id)) {
					this.pendingRequests.delete(id);
					reject(new Error("Parse timeout"));
				}
			}, 30000);
		});
	}

	terminate(): void {
		if (this.worker) {
			for (const { reject } of this.pendingRequests.values()) {
				reject(new Error("Worker terminated"));
			}
			this.pendingRequests.clear();

			this.worker.terminate();
			this.worker = null;
			this.initPromise = null;
		}
	}
}

export async function createFtmlService(
	WorkerConstructor: new () => Worker,
): Promise<Result<FtmlService, Error>> {
	try {
		const service = new FtmlService(WorkerConstructor);
		return ok(service);
	} catch (error) {
		return err(error as Error);
	}
}
