import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
	userId: string;
	userName: string;
}

const initialState: UserState = {
	userId: "",
	userName: "Anonymous",
};

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setUser: (state, action: PayloadAction<UserState>) => {
			state.userId = action.payload.userId;
			state.userName = action.payload.userName;
		},
	},
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
