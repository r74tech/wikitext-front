import { useCallback, useEffect, useRef } from "react";
import type { WorkerRequest, WorkerResponse } from "../types/worker";

interface UseWorkerOptions {
    onMessage?: (response: WorkerResponse) => void;
    onError?: (error: Error) => void;
    debounceMs?: number;
}

export function useWorker(WorkerConstructor: new () => Worker, options: UseWorkerOptions = {}) {
    const { onMessage, onError, debounceMs = 300 } = options;
    const workerRef = useRef<Worker | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const worker = new WorkerConstructor();
        workerRef.current = worker;

        worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
            onMessage?.(event.data);
        };

        worker.onerror = (_error) => {
            onError?.(new Error("Worker error"));
        };

        const initRequest: WorkerRequest = { type: "init" };
        worker.postMessage(initRequest);

        return () => {
            worker.terminate();
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [WorkerConstructor, onMessage, onError]);

    const postMessage = useCallback(
        (request: WorkerRequest) => {
            if (!workerRef.current) return;

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            if (debounceMs > 0 && request.type === "parse") {
                timeoutRef.current = setTimeout(() => {
                    workerRef.current?.postMessage(request);
                }, debounceMs);
            } else {
                workerRef.current.postMessage(request);
            }
        },
        [debounceMs],
    );

    return { postMessage };
}
