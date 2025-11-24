"use client";
import Link from "next/link";
import { useDispatch } from "react-redux";
import Navbar from "@/components/layout/Navbar/Navbar";
import LoginEmail from "./frontendComponents/Login/LoginEmail/LoginEmail";
import CreatePassword from "./frontendComponents/Login/LoginPassword/CreatePassword";
import LoginPassword from "./frontendComponents/Login/LoginPassword/LoginPassword";
import { useState } from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  email: z.email(),
});

export default function HomePage() {
  const dispatch = useDispatch();

  return (
    <div className="min-h-screen  relative overflow-hidden">
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 main">
        <div className="w-full max-w-4xl text-center">
          <LoginEmail />
        </div>
      </div>
    </div>
  );
}
