import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface PageState {
	shortId: string;
	title: string;
	source: string;
	html: string;
	styles: string[];
	isSaving: boolean;
	lastSaved?: Date;
	revisionCount: number;
}

const initialState: PageState = {
	shortId: "",
	title: "",
	source: "",
	html: "",
	styles: [],
	isSaving: false,
	revisionCount: 0,
};

const pageSlice = createSlice({
	name: "page",
	initialState,
	reducers: {
		setPage: (state, action: PayloadAction<Partial<PageState>>) => {
			return { ...state, ...action.payload };
		},
		setSource: (state, action: PayloadAction<string>) => {
			state.source = action.payload;
		},
		setTitle: (state, action: PayloadAction<string>) => {
			state.title = action.payload;
		},
		setHtml: (state, action: PayloadAction<{ html: string; styles: string[] }>) => {
			state.html = action.payload.html;
			state.styles = action.payload.styles;
		},
		setSaving: (state, action: PayloadAction<boolean>) => {
			state.isSaving = action.payload;
		},
		setShortId: (state, action: PayloadAction<string>) => {
			state.shortId = action.payload;
		},
		setRevisionCount: (state, action: PayloadAction<number>) => {
			state.revisionCount = action.payload;
		},
		clearPage: () => initialState,
	},
});

export const {
	setPage,
	setSource,
	setTitle,
	setHtml,
	setSaving,
	setShortId,
	setRevisionCount,
	clearPage,
} = pageSlice.actions;
export default pageSlice.reducer;
