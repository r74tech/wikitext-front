import type { FtmlSource, HtmlContent, PageId, PageTitle, ShortId } from "./shared";

export type PageStatus =
    | { type: "draft" }
    | { type: "processing" }
    | { type: "ready"; html: HtmlContent }
    | { type: "error"; message: string };

export type Page = {
    id: PageId;
    shortId?: ShortId;
    title: PageTitle;
    source: FtmlSource;
    status: PageStatus;
    createdAt: Date;
    updatedAt: Date;
    revisionCount: number;
};

export type ParseResult = {
    html: HtmlContent;
    styles: string[];
    metadata: ParseMetadata;
};

export type ParseMetadata = {
    tags: string[];
    parseTime: number;
};

export function createPage(id: PageId, title: PageTitle, source: FtmlSource, now: Date): Page {
    return {
        id,
        title,
        source,
        status: { type: "draft" },
        createdAt: now,
        updatedAt: now,
        revisionCount: 0,
    };
}

export function updatePageSource(page: Page, source: FtmlSource, now: Date): Page {
    return {
        ...page,
        source,
        status: { type: "draft" },
        updatedAt: now,
        revisionCount: page.revisionCount + 1,
    };
}

export function setPageProcessing(page: Page): Page {
    return {
        ...page,
        status: { type: "processing" },
    };
}

export function setPageReady(page: Page, html: HtmlContent): Page {
    return {
        ...page,
        status: { type: "ready", html },
    };
}

export function setPageError(page: Page, message: string): Page {
    return {
        ...page,
        status: { type: "error", message },
    };
}

export function isPageReady(page: Page): boolean {
    return page.status.type === "ready";
}

export function getPageHtml(page: Page): HtmlContent | null {
    return page.status.type === "ready" ? page.status.html : null;
}
