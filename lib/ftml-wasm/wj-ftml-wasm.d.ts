/**
 * Type definitions for FTML WASM module
 */

/**
 * Page information structure for FTML parsing
 */
export interface PageInfo {
    score?: number;
    alt_title?: string | null;
    category?: string | null;
    language?: string;
    page?: string;
    site?: string;
    tags?: string[];
    title?: string;
    [key: string]: unknown;
}

/**
 * HTML output from FTML parser
 */
export interface HtmlOutput {
    html: string;
    meta?: Record<string, unknown>;
    backlinks?: string[];
}

/**
 * Token structure from tokenizer
 */
export interface Token {
    type: string;
    value: string;
    start: number;
    end: number;
    [key: string]: unknown;
}

/**
 * AST Node structure
 */
export interface AstNode {
    element?: string;
    data?: unknown;
    elements?: AstNode[];
    [key: string]: unknown;
}

/**
 * Parse error structure
 */
export interface ParseError {
    type: string;
    message: string;
    position?: {
        start: number;
        end: number;
    };
    [key: string]: unknown;
}

/**
 * Detailed HTML output with AST and tokens
 */
export interface DetailedHtmlOutput extends HtmlOutput {
    tokens: Token[];
    ast: AstNode;
    errors: ParseError[];
}

/**
 * Wikitext rendering settings
 */
export interface WikitextSettings {
    mode?: "page" | "forum" | "comment";
    layout?: "wikidot" | "wikijump";
}

/**
 * Parsed result structure
 */
export interface ParsedResult {
    syntax_tree(): AstNode;
    errors(): ParseError[];
}

/**
 * Tokenized result structure
 */
export interface TokenizedResult {
    tokens(): Token[];
}

/**
 * UTF16 index map structure
 */
export interface IndexMap {
    indices: number[];
    mapping: Record<number, number>;
}

/**
 * Initialize the WASM module
 * Must be called before using any other functions
 */
export function init(): Promise<void>;

/**
 * Render FTML source to HTML
 * @param source - FTML source code
 * @param info - Page information object
 * @param mode - Rendering mode (default: "page")
 * @param layout - Layout style (default: "wikijump")
 * @returns HTML output with metadata and backlinks
 */
export function renderHTML(
    source: string,
    info: PageInfo,
    mode?: string,
    layout?: string,
): HtmlOutput;

/**
 * Render FTML source with detailed output including AST and tokens
 * @param source - FTML source code
 * @param info - Page information object
 * @param mode - Rendering mode (default: "page")
 * @param layout - Layout style (default: "wikijump")
 * @returns Detailed output with HTML, AST, tokens, and errors
 */
export function detailRenderHTML(
    source: string,
    info: PageInfo,
    mode?: string,
    layout?: string,
): DetailedHtmlOutput;

/**
 * Render FTML source to plain text
 * @param source - FTML source code
 * @param info - Page information object
 * @param mode - Rendering mode (default: "page")
 * @param layout - Layout style (default: "wikijump")
 * @returns Plain text output
 */
export function renderText(source: string, info: PageInfo, mode?: string, layout?: string): string;

/**
 * Parse FTML source and return AST
 * @param source - FTML source code
 * @param info - Page information object
 * @param mode - Rendering mode (default: "page")
 * @param layout - Layout style (default: "wikijump")
 * @returns Object with ast and errors
 */
export function parse(
    source: string,
    info: PageInfo,
    mode?: string,
    layout?: string,
): { ast: AstNode; errors: ParseError[] };

/**
 * Count words in parsed FTML AST
 * @param parsedResult - Parsed result from parse function
 * @returns Word count
 */
export function wordCount(parsedResult: { ast: AstNode; errors: ParseError[] }): number;

/**
 * Create a page info object with default values
 * @param options - Initial values for page info
 * @returns Page info object
 */
export function makeInfo(options?: Partial<PageInfo>): PageInfo;

/**
 * Check if WASM module is ready
 */
export declare const ready: boolean;

/**
 * Promise that resolves when WASM module is loaded
 */
export declare const loading: Promise<void>;

/**
 * Get FTML version
 */
export declare const version: string;

/**
 * Tokenize FTML source
 */
export function tokenize(source: string): TokenizedResult;

/**
 * Preprocess FTML source
 */
export function preprocess(source: string): string;

/**
 * Get UTF16 index mapping
 */
export function getUTF16IndexMap(source: string): IndexMap;

/**
 * Inspect tokens
 */
export function inspectTokens(tokens: Token[]): Record<string, unknown>;

/**
 * Get parsing errors
 */
export function errors(parsed: ParsedResult): ParseError[];

/**
 * Page class
 */
export class Page {
    constructor(info: PageInfo);
}

/**
 * Default export is the module itself
 */
declare const ftmlModule: {
    init: typeof init;
    renderHTML: typeof renderHTML;
    detailRenderHTML: typeof detailRenderHTML;
    renderText: typeof renderText;
    parse: typeof parse;
    wordCount: typeof wordCount;
    makeInfo: typeof makeInfo;
    ready: boolean;
    loading: Promise<void>;
    version: string;
    tokenize: typeof tokenize;
    preprocess: typeof preprocess;
    getUTF16IndexMap: typeof getUTF16IndexMap;
    inspectTokens: typeof inspectTokens;
    errors: typeof errors;
    Page: typeof Page;
};

export default ftmlModule;
