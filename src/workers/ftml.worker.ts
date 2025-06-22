import {
	init,
	loading,
	makeInfo,
	ready,
	renderHTML,
} from "../../lib/ftml-wasm/esm/wj-ftml-wasm.js";
import type { ParseMetadata, ParseResult } from "../core/page";
import { type FtmlSource, HtmlContent } from "../core/shared";
import type { WorkerRequest, WorkerResponse } from "../types/worker";

const STYLE_TAG_REGEX = /<style[^>]*>([^<]*)<\/style>/g;
const STYLE_TAG_CLEANUP_REGEX = /<\/?style[^>]*>/g;
const MAX_PARSE_TIME_MS = 30000;
const MEMORY_CHECK_INTERVAL_MS = 60000;

type WorkerState = {
	initialized: boolean;
	activeParses: Map<string, AbortController>;
	parseCount: number;
	totalParseTime: number;
	lastMemoryCheck: number;
};

const state: WorkerState = {
	initialized: false,
	activeParses: new Map(),
	parseCount: 0,
	totalParseTime: 0,
	lastMemoryCheck: Date.now(),
};

function extractStyleContent(styleTag: string): string {
	return styleTag.replace(STYLE_TAG_CLEANUP_REGEX, "");
}

function extractStyles(html: string): string[] {
	const matches = html.match(STYLE_TAG_REGEX);
	return matches ? matches.map(extractStyleContent) : [];
}

function removeStyleTags(html: string): string {
	return html.replace(STYLE_TAG_REGEX, "");
}

function createMetadata(parseTime: number): ParseMetadata {
	return {
		tags: [],
		parseTime,
	};
}

function checkMemoryPressure(): boolean {
	const memoryInfo = (
		performance as unknown as {
			memory: { usedJSHeapSize: number; jsHeapSizeLimit: number };
		}
	).memory;
	if (!memoryInfo) return false;

	const now = Date.now();
	if (now - state.lastMemoryCheck < MEMORY_CHECK_INTERVAL_MS) {
		return false;
	}

	state.lastMemoryCheck = now;
	const { usedJSHeapSize, jsHeapSizeLimit } = memoryInfo;
	const usage = usedJSHeapSize / jsHeapSizeLimit;

	return usage > 0.9;
}

function cleanupIfNeeded(): void {
	if (checkMemoryPressure()) {
		const globalWithGc = globalThis as unknown as { gc: () => void };
		if (typeof globalWithGc.gc === "function") {
			globalWithGc.gc();
		}

		state.activeParses.clear();
	}
}

async function initializeWasm(): Promise<void> {
	if (state.initialized) return;

	try {
		await init();

		if (!ready) {
			await loading;
		}

		state.initialized = true;
	} catch (error) {
		throw new Error(
			`Failed to initialize WASM module: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

async function parseFtml(
	source: FtmlSource,
	requestId: string,
	signal: AbortSignal,
): Promise<ParseResult> {
	const startTime = performance.now();

	try {
		await initializeWasm();

		if (signal.aborted) {
			throw new Error("Parse operation was aborted");
		}

		const info = makeInfo({ score: 0 });

		const htmlOutput = renderHTML(source, info);

		if (signal.aborted) {
			throw new Error("Parse operation was aborted");
		}

		const parseTime = performance.now() - startTime;

		const styles = extractStyles(htmlOutput.html);
		const htmlWithoutStyles = removeStyleTags(htmlOutput.html);
		const metadata = createMetadata(parseTime);

		state.parseCount++;
		state.totalParseTime += parseTime;

		return {
			html: HtmlContent(htmlWithoutStyles),
			styles,
			metadata,
		};
	} finally {
		state.activeParses.delete(requestId);

		cleanupIfNeeded();
	}
}

function createErrorResponse(id: string, error: unknown): WorkerResponse {
	let message: string;

	if (error instanceof Error) {
		message = error.message;
	} else if (typeof error === "string") {
		message = error;
	} else {
		message = "An unknown error occurred during parsing";
	}

	return {
		type: "error",
		id,
		error: message,
	};
}

async function handleInit(): Promise<WorkerResponse> {
	await initializeWasm();
	return { type: "initialized" };
}

async function handleParse(
	request: Extract<WorkerRequest, { type: "parse" }>,
): Promise<WorkerResponse> {
	const { id, source } = request;

	const abortController = new AbortController();
	state.activeParses.set(id, abortController);

	const timeoutId = setTimeout(() => {
		abortController.abort();
	}, MAX_PARSE_TIME_MS);

	try {
		const result = await parseFtml(source, id, abortController.signal);

		return {
			type: "parsed",
			id,
			result,
		};
	} catch (error) {
		return createErrorResponse(id, error);
	} finally {
		clearTimeout(timeoutId);
	}
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
	const request = event.data;

	try {
		let response: WorkerResponse;

		switch (request.type) {
			case "init":
				response = await handleInit();
				break;

			case "parse":
				response = await handleParse(request);
				break;

			default:
				throw new Error(`Unknown request type: ${request}`);
		}

		self.postMessage(response);
	} catch (error) {
		const errorResponse: WorkerResponse = {
			type: "error",
			id: "type" in request && request.type === "parse" ? request.id : "unknown",
			error: error instanceof Error ? error.message : "Worker error",
		};

		self.postMessage(errorResponse);
	}
};

self.addEventListener("beforeunload", () => {
	for (const [, controller] of state.activeParses) {
		controller.abort();
	}
	state.activeParses.clear();
});

export type { WorkerState };
