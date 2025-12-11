"use client";
import type React from "react";
import { useTransition } from "react";
import { useState } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthLayout from "@/components/custom/AuthLayout";
import { toast } from "sonner";
import axios from "axios";
import LoginPassword from "../LoginPassword/LoginPassword";
import CreatePassword from "../LoginPassword/CreatePassword";
import { ErrorToast } from "@/components/custom/ErrorToast";
import { successToast } from "@/components/custom/SuccessToast";
import ForgotPassword from "../../ForgotPassword/ForgotPassword";
import { OTPVerification } from "../../OtpVerification/OtpVerification";

const formSchema = z.object({
  email: z.email(),
});

export default function LoginEmail() {
  const [isPending, startTransition] = useTransition();
  const [authStep, setAuthStep] = useState<
    "email" | "login" | "create" | "forgot" | "otp"
  >("email");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });
  const userEmail = form.watch("email");

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const res = await axios.post("/api/auth/verify-email", {
          email: values.email,
        });
        const { success, message } = res.data;

        if (!success) {
          ErrorToast(message);
          return;
        }

        localStorage.setItem("Email for password", values.email);

        successToast("Email verified! Redirecting to password entry...");

        if (res.data.isPasswordExist === true) {
          setAuthStep("login");
        } else {
          setAuthStep("create");
        }
      } catch (error: any) {
        console.error("Email verification error:", error);
        toast.error(
          "Verification failed. Please check your connection and try again.",
          {
            description: error.message,
            position: "bottom-right",
            duration: 3000,
            className: "bg-red-700 text-white border border-red-600",
            style: {
              backgroundColor: "#C1292E",
              color: "white",
              border: "1px solid #3e5692",
            },
          }
        );
      }
    });
  }

  const backButton =
    authStep === "login" || authStep === "create" ? (
      <Button
        variant="ghost"
        className="text-slate-600 hover:text-white border hover:bg-gradient-to-r from-sky-600 to-sky-800 hover:from-sky-700 hover:to-sky-900"
        onClick={() => setAuthStep("email")}
      >
        <ArrowLeft className="w-4 h-4" />
        <h2 className="hidden font-gilMedium md:flex">Back to Home</h2>
      </Button>
    ) : null;

  return (
    <AuthLayout
      header={
        authStep === "forgot"
          ? "Forgot Password"
          : authStep === "otp"
          ? "Verify Your Email"
          : "Welcome Back"
      }
      title={
        authStep === "forgot"
          ? "Enter your email and we’ll send you a verification code to reset your password."
          : authStep === "otp"
          ? "We’ve sent a 6-digit verification code to your email. Enter it below to continue."
          : "Sign in to your leave management account"
      }
      navigateTitle=""
      navigator=""
      navigateTo=""
      backButton={backButton}
    >
      {authStep === "email" && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-slate-700 font-gilSemiBold flex items-center gap-2">
                      <Mail className="w-4 h-4 text-sky-600" />
                      <span className="text-sm">Email Address</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                        className="h-10 text-xs font-gilMedium rounded-md border-slate-200 focus:border-sky-500 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 font-gilRegular bg-gradient-to-r from-sky-700 to-sky-900 hover:from-sky-800 hover:to-sky-900 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 tracking-[0.05rem] cursor-pointer"
            >
              <h2>
                {isPending ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin text-xs md:text-sm mr-2"></div>
                    Continuing...
                  </div>
                ) : (
                  <div className="flex gap-2 items-center text-xs md:text-sm">
                    Continue
                  </div>
                )}
              </h2>
            </Button>
          </form>
        </Form>
      )}

      {authStep === "login" && (
        <LoginPassword email={userEmail} setAuthStep={setAuthStep} />
      )}
      {authStep === "create" && (
        <CreatePassword email={userEmail} setAuthStep={setAuthStep} />
      )}
      {authStep === "forgot" && (
        <ForgotPassword email={userEmail} setAuthStep={setAuthStep} />
      )}
      {authStep === "otp" && (
        <OTPVerification
          email={userEmail}
          setAuthStep={setAuthStep}
          onBack={() => setAuthStep("forgot")}
          title=""
          description=""
        />
      )}
    </AuthLayout>
  );
}
