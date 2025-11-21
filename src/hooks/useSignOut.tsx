"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { removeState } from "@/libs/dataslice";
import { useDispatch } from "react-redux";

export function useSignOut() {
  const router = useRouter();
  const dispatch = useDispatch();

  async function signOutHandler() {
    await signOut({ redirect: false }); // Prevent automatic redirect

    // while signing out, clearing all the redux state
    dispatch(removeState());
    router.push("/"); // Manual redirect after sign out
  }

  return signOutHandler;
}
