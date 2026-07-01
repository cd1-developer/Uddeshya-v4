"use client";
import { useTransition, useState } from "react";
import PasswordInput from "@/components/custom/PasswordInput";
import z from "zod";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { successToast } from "@/components/custom/SuccessToast";

interface CreatePasswordProps {
  email: string;
  setAuthStep: React.Dispatch<
    React.SetStateAction<"email" | "login" | "create" | "forgot" | "otp">
  >;
}

const CreatePassword = ({ email, setAuthStep }: CreatePasswordProps) => {
  const [isPending, startTransition] = useTransition();
  const formSchema = z
    .object({
      password: z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword: z
        .string()
        .min(6, "Password must be at least 6 characters"),
    })
    .refine(
      (data) => {
        if (data.password !== data.confirmPassword) {
          return false;
        }
        return true;
      },
      { message: "Password should be same", path: ["confirmPassword"] }
    );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const { password } = values;

        const res = await axios.post("/api/auth/create-password", {
          email,
          password,
        });
        if (res.data.success) {
          setAuthStep("email");
          successToast("Sign up successful");
        } else {
          toast.error("Sign up failed");
        }
      } catch (error: any) {
        let message = "Something went wrong";
        if (axios.isAxiosError(error)) {
          if (error.response) {
            // Server returned an error
            message =
              error.response.data?.message ||
              `Server Error: ${error.response.status}`;
          } else if (error.request) {
            // No response from server
            message =
              "No response from server. Please check your internet connection.";
          } else {
            // Something else happened while setting up request
            message = error.message;
          }
        } else {
          message = error?.message || message;
        }

        toast.error("Sign up failed");
        console.log("Signup error", error);
      }
    });
  }

  return (
    <div>
      <div className="">
        <Button
          variant="ghost"
          className="text-slate-600 hover:text-white border hover:bg-gradient-to-r from-sky-600 to-sky-800 hover:from-sky-700 hover:to-sky-900"
          onClick={() => setAuthStep("email")}
        >
          <ArrowLeft className="w-4 h-4" />
          <h2 className="hidden font-gilMedium md:flex">Back to Home</h2>
        </Button>
      </div>
      <div className="space-y-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-slate-700  flex items-center gap-2">
                    <Lock className="w-4 h-4 text-sky-600" />
                    Create Password
                  </FormLabel>
                  <FormControl>
                    <PasswordInput {...field} className="" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-slate-700  flex items-center gap-2">
                    <Lock className="w-4 h-4 text-sky-600" />
                    Enter Confirm Password
                  </FormLabel>
                  <FormControl>
                    <PasswordInput {...field} className="" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
      </div>
    </div>
  );
};

export default CreatePassword;
