"use client";
import React, { useEffect } from "react";
import useFetchEmployees from "@/hooks/useFetchEmployees";

function layout({ children }: { children: React.ReactNode }) {
  const { fetchEmployees } = useFetchEmployees();

  useEffect(() => {
    fetchEmployees();
  }, []);
  return <div>{children}</div>;
}

export default layout;
