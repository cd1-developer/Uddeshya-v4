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
    <div className="min-h-screen relative overflow-hidden">
      <div className=" z-10 flex items-center justify-center main">
        <div className="w-full">
          <LoginEmail />
        </div>
      </div>
    </div>
  );
}
