"use client";

import { Provider } from "react-redux";
import { store, persistor } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import ThreeBodyLoader from "@/components/custom/Loader/ThreeBodyLoader";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={<ThreeBodyLoader />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
