/**
 * Type definitions for FTML WASM module
 */

/**
 * Page information structure for FTML parsing
 */
export interface PageInfo {
	score?: number;
	[key: string]: unknown;
}

/**
 * HTML output from FTML parser
 */
export interface HtmlOutput {
	html: string;
	styles?: string[];
	meta?: Record<string, unknown>;
}

/**
 * Wikitext rendering settings
 */
export interface WikitextSettings {
	mode?: "page" | "forum" | "comment";
	layout?: "wikidot" | "wikijump";
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
 * @param settings - Optional rendering settings
 * @returns HTML output with embedded styles
 */
export function renderHTML(source: string, info: PageInfo, settings?: WikitextSettings): HtmlOutput;

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
 * Create WikitextSettings from mode configuration
 */
export declare namespace WikitextSettings {
	function from_mode(config: { mode: string; layout?: string }): WikitextSettings;
}
