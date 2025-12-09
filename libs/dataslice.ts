import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, Employee, Leave, Holiday } from "@/interfaces";

const initialState = {
  userInfo: {} as User,
  employee: [] as Employee[],
  leave: [] as Leave[],
  holiday: [] as Holiday[],
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
    setLeave: (state, action: PayloadAction<Leave[]>) => {
      state.leave = action.payload;
    },
    setHolidays: (state, action: PayloadAction<Holiday[]>) => {
      state.holiday = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    removeState: () => initialState,
  },
});

export const {
  setUserInfo,
  removeState,
  setEmployee,
  setLeave,
  setIsLoading,
  setHolidays,
} = dataSlice.actions;

export default dataSlice.reducer;
