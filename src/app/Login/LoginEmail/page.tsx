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
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthLayout from "@/components/custom/AuthLayout";
import { toast } from "sonner";
import axios from "axios";
import LoginPassword from "../LoginPassword/LoginPassword";
import CreatePassword from "../LoginPassword/CreatePassword";

export default function LoginEmail() {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"email" | "login" | "create">("email");
  const [userEmail, setUserEmail] = useState<string>("");
  const formSchema = z.object({
    email: z.email(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const res = await axios.post(
          "/api/verify-email",
          {
            email: values.email,
          },
          { headers: { "Content-Type": "application/json" } }
        );

        if (res.data.success) {
          setUserEmail(values.email);
          localStorage.setItem("Email for password", values.email);
          toast.success("Email verified! Redirecting to password entry...", {
            position: "bottom-right",
            duration: 1000,
            className: "bg-green-700 text-white border border-green-600",
            style: {
              backgroundColor: "#285943",
              color: "white",
              border: "1px solid #3e5692",
            },
          });

          if (res.data.isPasswordExist === true) {
            setStep("login");
          } else {
            setStep("create");
          }
        } else {
          toast.error(res.data.message || "Something went wrong");
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

  return (
    <AuthLayout
      header="Welcome Back"
      title="Sign in to your leave management account"
      navigateTitle="Don't have an account?"
      navigator="/Signup"
      navigateTo="Sign up"
    >
      {step === "email" && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-slate-700 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-sky-600" />
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                        className="h-12 rounded-xl border-slate-200 focus:border-sky-500 focus:ring-blue-500/20 transition-all duration-200"
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
              className="w-full h-12 font-gilRegular bg-gradient-to-r from-sky-700 to-sky-900 hover:from-sky-800 hover:to-sky-900 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 tracking-[0.05rem] cursor-pointer"
            >
              <h2>
                {isPending ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Continuing...
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">Continue</div>
                )}
              </h2>
            </Button>
          </form>
        </Form>
      )}

      {step === "login" && <LoginPassword email={userEmail} />}
      {step === "create" && (
        <CreatePassword email={userEmail} setStep={setStep} />
      )}
    </AuthLayout>
  );
}
