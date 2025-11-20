"use client";
import Link from "next/link";
import { useDispatch } from "react-redux";
import Navbar from "@/components/layout/Navbar/Navbar";
import LoginEmail from "@/app/frontendComponents/Login/LoginEmail/LoginEmail";

export default function HomePage() {
  const dispatch = useDispatch();

  return (
    <div className="min-h-screen  relative overflow-hidden">
      <Navbar />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 main">
        <div className="w-full max-w-4xl text-center">
          <LoginEmail />
        </div>
      </div>
    </div>
  );
}
