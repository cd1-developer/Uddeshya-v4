import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, Employee, Leave, Holiday } from "@/interfaces";

const initialState = {
  userInfo: {} as User,
  employee: [] as Employee[],
  leave: [] as Leave[],
  holiday: [] as Holiday[],
  isLoading: false,
  employeeInfoEndCursor: [] as (Number | null)[],
  employeeLeaveEndCursor: [] as (Number | null)[],
  assignMemberLeaveEndCursor: [] as (Number | null)[],
  holidayEndCursor: [] as (Number | null)[],
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
    setEmployeeInfoEndCursor: (state, action: PayloadAction<Number | null>) => {
      state.employeeInfoEndCursor.push(action.payload);
    },
    setEmployeeLeaveEndCursor: (
      state,
      action: PayloadAction<Number | null>
    ) => {
      state.employeeLeaveEndCursor.push(action.payload);
    },
    setAssignMemberLeaveEndCursor: (
      state,
      action: PayloadAction<Number | null>
    ) => {
      state.assignMemberLeaveEndCursor.push(action.payload);
    },
    setHolidayEndCursor: (state, action: PayloadAction<Number | null>) => {
      state.holidayEndCursor.push(action.payload);
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
  setEmployeeInfoEndCursor,
  setEmployeeLeaveEndCursor,
  setAssignMemberLeaveEndCursor,
  setHolidayEndCursor,
} = dataSlice.actions;

export default dataSlice.reducer;
