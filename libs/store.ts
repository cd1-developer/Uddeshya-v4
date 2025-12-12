import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import dataSlice from "./dataslice";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  storage,
<<<<<<< HEAD
  whitelist: ["userInfo", "employee", "leave"],
=======
  whitelist: [
    "userInfo",
    "employee",
    "setEmployeeInfoEndCursor",
    "setEmployeeLeaveEndCursor",
    "setAssignMemberLeaveEndCursor",
    "setHolidayEndCursor",
  ],
>>>>>>> d1490de3a4e9bc796b57f92a06b44eaa92a368c8
};

const rootReducer = combineReducers({
  dataSlice: persistReducer(persistConfig, dataSlice),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
