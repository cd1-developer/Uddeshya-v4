import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/interfaces";

const initialState = {
  userInfo: {} as User,
  isLoading: false,
};

const dataSlice = createSlice({
  name: "dataslice",
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<User>) => {
      state.userInfo = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    removeState: () => initialState,
  },
});

export const { setUserInfo, removeState, setIsLoading } = dataSlice.actions;

export default dataSlice.reducer;
