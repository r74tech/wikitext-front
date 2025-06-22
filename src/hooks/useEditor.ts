import { useCallback, useEffect, useRef } from "react";
import type { FtmlSource } from "../core/shared";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setHtml, setSaving, setSource, setTitle } from "../store/pageSlice";
import type { WorkerRequest, WorkerResponse } from "../types/worker";
import FtmlWorker from "../workers/ftml.worker.ts?worker";
import { useWorker } from "./useWorker";

export function useEditor() {
	const dispatch = useAppDispatch();
	const { source, title, isSaving, shortId } = useAppSelector((state) => state.page);
	const previousSourceRef = useRef<string>("");
	const previousShortIdRef = useRef<string>("");

	const handleWorkerMessage = useCallback(
		(response: WorkerResponse) => {
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
		},
		[dispatch],
	);

	const workerRef = useWorker(FtmlWorker, {
		onMessage: handleWorkerMessage,
		debounceMs: 300,
	});

	const updateSource = useCallback(
		(newSource: string) => {
			dispatch(setSource(newSource));
			dispatch(setSaving(true));

			const request: WorkerRequest = {
				type: "parse",
				id: `parse-${Date.now()}`,
				source: newSource as FtmlSource,
			};
			workerRef.postMessage(request);
		},
		[dispatch, workerRef],
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
			const request: WorkerRequest = {
				type: "parse",
				id: `parse-${Date.now()}`,
				source: source as FtmlSource,
			};
			workerRef.postMessage(request);
		}
	}, [source, shortId, dispatch, workerRef]);

	return {
		source,
		title,
		isSaving,
		updateSource,
		updateTitle,
	};
}
