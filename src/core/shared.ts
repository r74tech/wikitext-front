declare const brand: unique symbol;

export type Brand<T, TBrand extends string> = T & {
    [brand]: TBrand;
};

export type PageId = Brand<string, "PageId">;
export type ShortId = Brand<string, "ShortId">;
export type SessionId = Brand<string, "SessionId">;

export type FtmlSource = Brand<string, "FtmlSource">;
export type HtmlContent = Brand<string, "HtmlContent">;
export type PageTitle = Brand<string, "PageTitle">;

export const PageId = (id: string): PageId => id as PageId;
export const ShortId = (id: string): ShortId => id as ShortId;
export const SessionId = (id: string): SessionId => id as SessionId;
export const FtmlSource = (source: string): FtmlSource => source as FtmlSource;
export const HtmlContent = (html: string): HtmlContent => html as HtmlContent;
export const PageTitle = (title: string): PageTitle => title as PageTitle;

export const isPageId = (value: unknown): value is PageId =>
    typeof value === "string" && value.length > 0;

export const isShortId = (value: unknown): value is ShortId =>
    typeof value === "string" && /^[a-zA-Z0-9]{6,}$/.test(value);

export const isFtmlSource = (value: unknown): value is FtmlSource => typeof value === "string";
