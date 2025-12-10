"use client";

import type React from "react";
import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, z } from "zod";
import axios from "axios";
import { toast } from "sonner";

import { successToast } from "@/components/custom/SuccessToast";
import { ErrorToast } from "@/components/custom/ErrorToast";
import { useSendOtp } from "@/hooks/useSendOtp";

interface OTPVerificationProps {
  email: string;
  onBack: () => void;
  title: string;
  description: string;
  setAuthStep: React.Dispatch<
    React.SetStateAction<"email" | "login" | "create" | "forgot" | "otp">
  >;
}

export function OTPVerification({
  email,
  onBack,
  title,
  description,
  setAuthStep,
}: OTPVerificationProps) {
  const [isPending, startTransition] = useTransition();
  const { isPending: isResending, sendOtp } = useSendOtp();
  const [timeLeft, setTimeLeft] = useState(60);

  const FormSchema = z.object({
    code: z.string().min(6, {
      message: "Your one-time password must be 6 characters.",
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  async function handleResendOtp() {
    try {
      const response = await sendOtp(email);

      const { success, message } = response;

      // ❌ Failed to send OTP
      if (!success) {
        ErrorToast(message || "Unable to resend OTP. Please try again.");
        return;
      }

      // ✅ OTP resent successfully
      successToast(message || "OTP resent successfully!");

      // Reset countdown timer
      setTimeLeft(60);
    } catch (error: any) {
      // 🔥 Handle unexpected errors (network, runtime, etc.)
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while resending OTP.";

      ErrorToast(msg);
    }
  }

  function onSubmit(values: z.infer<typeof FormSchema>) {
    const { code } = values;

    startTransition(async () => {
      try {
        const res = await axios.post("/api/auth/verifyOtp", {
          userId: localStorage.getItem("userId"),
          code,
        });

        const { success, message } = res.data;

        if (!success) {
          ErrorToast(message);
          return;
        }

        localStorage.setItem("userId", "");
        setAuthStep("create");

        successToast(message);
      } catch (error: any) {
        console.log("OTP verification error:", error);
        ErrorToast(
          error.response?.data?.message ||
            "Something went wrong during OTP verification"
        );
      }
    });
  }

  return (
    <div className="flex items-center justify-center">
      <div>
        {/* Header */}
        <div className="text-center space-y-4 mb-6">
          <h2 className="text-2xl font-bold text-[#1D4ED8]">{title}</h2>
          <p className="text-gray-600">{description}</p>
          <p className="text-sm text-gray-500">
            Code sent to:{" "}
            <span className="text-sm font-bold bg-gradient-to-r from-sky-700 to-sky-900 bg-clip-text text-transparent">
              {email}
            </span>
          </p>
        </div>

        {/* OTP Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* OTP Input Fields */}
            <div className="flex justify-center space-x-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center gap-2">
                    <FormLabel className="text-blue-900">
                      One-Time Password
                    </FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormDescription className="text-gray-500">
                      Enter the 6-digit verification code sent to your email.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending}
              className="
              w-full h-10 font-gilRegular bg-gradient-to-r from-sky-700 to-sky-900 hover:from-sky-800 hover:to-sky-900 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 tracking-[0.05rem] cursor-pointer
            "
            >
              {isPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying…</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verify Code</span>
                </div>
              )}
            </Button>

            {/* Resend Code */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Didn't receive the code?</p>

              {timeLeft > 0 ? (
                <p className="text-sm text-gray-500">
                  Resend in{" "}
                  <span className="font-semibold bg-gradient-to-r from-sky-700 to-sky-900 bg-clip-text text-transparent">
                    {timeLeft}s
                  </span>
                </p>
              ) : (
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="bg-gradient-to-r from-sky-700 to-sky-900 bg-clip-text text-transparent hover:text-blue-900"
                >
                  {isResending ? (
                    <div className="flex items-center space-x-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Resending...</span>
                    </div>
                  ) : (
                    "Resend Code"
                  )}
                </Button>
              )}
            </div>

            {/* Back Button */}
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                className="text-gray-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
