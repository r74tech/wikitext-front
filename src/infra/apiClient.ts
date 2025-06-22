import { err, ok, type Result } from "neverthrow";
import type { FtmlSource, PageTitle, ShortId } from "../core/shared";

export interface DataResponse<T> {
    data: T | null;
    error: string | null;
}

export interface ClientPageData {
    title: string;
    source: string;
    shortId: string;
    revisionCount: number;
    updatedAt: string;
    updatedBy: string;
}

export interface ClientRevisionData {
    revisionId: number;
    shortId: string;
    title: string;
    source: string;
    revisionCount: number;
    createdAt: string;
    createdBy: string;
}

export interface SaveDataRequest {
    title: string;
    source: string;
    createdBy: string;
}

export class ApiClient {
    constructor(private baseUrl: string) {}

    private async fetchJson<T>(url: string, options?: RequestInit): Promise<Result<T, Error>> {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    ...options?.headers,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
                return err(new Error(errorData.error || `HTTP ${response.status}`));
            }

            const data: DataResponse<T> = await response.json();

            if (data.error) {
                return err(new Error(data.error));
            }

            if (data.data === null) {
                return err(new Error("No data returned from API"));
            }

            return ok(data.data);
        } catch (error) {
            return err(error instanceof Error ? error : new Error("Network error"));
        }
    }

    async createPage(
        title: PageTitle,
        source: FtmlSource,
        createdBy: string,
    ): Promise<Result<ClientPageData, Error>> {
        const payload = {
            title: title as string,
            source: source as string,
            createdBy,
        };
        return this.fetchJson<ClientPageData>(`${this.baseUrl}/v1/data`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }

    async updatePage(
        shortId: ShortId,
        title: PageTitle,
        source: FtmlSource,
        createdBy: string,
    ): Promise<Result<ClientPageData, Error>> {
        const payload = {
            title: title as string,
            source: source as string,
            createdBy,
        };
        return this.fetchJson<ClientPageData>(`${this.baseUrl}/v1/data/${shortId}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
        });
    }

    async getPage(shortId: ShortId): Promise<Result<ClientPageData, Error>> {
        return this.fetchJson<ClientPageData>(`${this.baseUrl}/v1/data/${shortId}`);
    }

    async getPageHistory(shortId: ShortId): Promise<Result<ClientRevisionData[], Error>> {
        return this.fetchJson<ClientRevisionData[]>(`${this.baseUrl}/v1/data/${shortId}/history`, {
            method: "POST",
        });
    }

    async getPageRevision(
        shortId: ShortId,
        revisionId: number,
    ): Promise<Result<ClientRevisionData, Error>> {
        return this.fetchJson<ClientRevisionData>(
            `${this.baseUrl}/v1/data/${shortId}/revision/${revisionId}`,
            { method: "POST" },
        );
    }

    async checkHealth(): Promise<Result<boolean, Error>> {
        const result = await this.fetchJson<{ status: string }>(`${this.baseUrl}/v1/health`);
        return result.map((data) => data.status === "healthy");
    }
}
