import type { ParseResult } from "../core/page";
import type { FtmlSource } from "../core/shared";

export type WorkerRequest = { type: "parse"; id: string; source: FtmlSource } | { type: "init" };

export type WorkerResponse =
    | { type: "parsed"; id: string; result: ParseResult }
    | { type: "error"; id: string; error: string }
    | { type: "initialized" };

export interface FtmlWorkerAPI {
    parse(source: FtmlSource): Promise<ParseResult>;
    terminate(): void;
}
