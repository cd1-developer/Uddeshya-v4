import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/interfaces";
import { Employee } from "@/interfaces";

const initialState = {
  userInfo: {} as User,
  employee: [] as Employee[],
  isLoading: false,
};

const dataSlice = createSlice({
  name: "dataslice",
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<User>) => {
      state.userInfo = action.payload;
    },
    setEmployee: (state, action: PayloadAction<Employee[]>) => {
      state.employee = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    removeState: () => initialState,
  },
});

export const { setUserInfo, removeState, setEmployee, setIsLoading } =
  dataSlice.actions;

export default dataSlice.reducer;
