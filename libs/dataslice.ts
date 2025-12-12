import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, Employee, Leave, Holiday } from "@/interfaces";

function removeDuplicates(data: Employee[]) {
  const set = new Set();
  return data.filter((item: Employee) => {
    if (set.has(item.id)) {
      return false;
    }
    set.add(item.id);
    return true;
  });
}

const initialState = {
  userInfo: {} as User,
  employee: [] as Employee[],
  leave: [] as Leave[],
  holiday: [] as Holiday[],
  isLoading: false,
  employeeInfoEndCursor: [] as (number | null)[],
  employeeLeaveEndCursor: [] as (number | null)[],
  assignMemberLeaveEndCursor: [] as (number | null)[],
  holidayEndCursor: [] as (number | null)[],
};

const dataSlice = createSlice({
  name: "dataslice",
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<User>) => {
      state.userInfo = action.payload;
    },
    setEmployee: (state, action: PayloadAction<Employee[]>) => {
      state.employee = removeDuplicates([...state.employee, ...action.payload]);
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
    setEmployeeInfoEndCursor: (state, action: PayloadAction<number | null>) => {
      state.employeeInfoEndCursor.push(action.payload);
    },
    setEmployeeLeaveEndCursor: (
      state,
      action: PayloadAction<number | null>
    ) => {
      state.employeeLeaveEndCursor.push(action.payload);
    },
    setAssignMemberLeaveEndCursor: (
      state,
      action: PayloadAction<number | null>
    ) => {
      state.assignMemberLeaveEndCursor.push(action.payload);
    },
    setHolidayEndCursor: (state, action: PayloadAction<number | null>) => {
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
