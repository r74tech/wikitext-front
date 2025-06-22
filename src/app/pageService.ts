import { err, ok, type Result } from "neverthrow";
import type { Page, ParseResult } from "../core/page";
import {
	createPage,
	setPageError,
	setPageProcessing,
	setPageReady,
	updatePageSource,
} from "../core/page";
import type { FtmlSource, PageId, PageTitle } from "../core/shared";
import type { FtmlService } from "../infra/ftmlService";

export interface PageRepository {
	findById(id: PageId): Promise<Result<Page | null, Error>>;
	save(page: Page): Promise<Result<Page, Error>>;
	findByShortId(shortId: string): Promise<Result<Page | null, Error>>;
}

export class PageService {
	constructor(
		private ftmlService: FtmlService,
		private pageRepo: PageRepository,
	) {}

	async createNewPage(
		tempId: PageId,
		title: PageTitle,
		source: FtmlSource,
	): Promise<Result<Page, Error>> {
		const tempPage = createPage(tempId, title, source, new Date());

		const saveResult = await this.pageRepo.save(tempPage);
		if (saveResult.isErr()) {
			return err(saveResult.error);
		}

		const savedPage = saveResult.value;

		return ok(savedPage);
	}

	async updatePageContent(
		pageId: PageId,
		title: PageTitle,
		source: FtmlSource,
	): Promise<Result<Page, Error>> {
		const pageResult = await this.pageRepo.findById(pageId);

		if (pageResult.isErr()) {
			return err(pageResult.error);
		}

		const page = pageResult.value;
		if (!page) {
			return err(new Error("Page not found"));
		}

		const updatedPage = {
			...updatePageSource(page, source, new Date()),
			title: title,
		};

		const saveResult = await this.pageRepo.save(updatedPage);
		if (saveResult.isErr()) {
			return err(saveResult.error);
		}

		const savedPage = saveResult.value;

		return ok(savedPage);
	}

	async parsePage(pageId: PageId): Promise<Result<ParseResult, Error>> {
		const pageResult = await this.pageRepo.findById(pageId);

		if (pageResult.isErr()) {
			return err(pageResult.error);
		}

		const page = pageResult.value;
		if (!page) {
			return err(new Error("Page not found"));
		}

		try {
			const processingPage = setPageProcessing(page);
			await this.pageRepo.save(processingPage);

			const parseResult = await this.ftmlService.parse(page.source);

			const readyPage = setPageReady(processingPage, parseResult.html);
			await this.pageRepo.save(readyPage);

			return ok(parseResult);
		} catch (error) {
			const errorPage = setPageError(
				page,
				error instanceof Error ? error.message : "Unknown error",
			);
			await this.pageRepo.save(errorPage);

			return err(error as Error);
		}
	}

	async getPageByShortId(shortId: string): Promise<Result<Page | null, Error>> {
		return this.pageRepo.findByShortId(shortId);
	}

	async getPageById(id: PageId): Promise<Result<Page | null, Error>> {
		return this.pageRepo.findById(id);
	}
}
