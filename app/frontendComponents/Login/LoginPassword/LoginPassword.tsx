"use client";
import { Lock, ArrowLeft } from "lucide-react";
import PasswordInput from "@/components/custom/PasswordInput";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SignInResponse } from "next-auth/react";
import { ErrorToast } from "@/components/custom/ErrorToast";
import { successToast } from "@/components/custom/SuccessToast";

interface LoginPasswordProps {
  email: string;
  setAuthStep: React.Dispatch<
    React.SetStateAction<"email" | "login" | "create" | "forgot" | "otp">
  >;
}
const LoginPassword = ({ email, setAuthStep }: LoginPasswordProps) => {
  const [isPending, startTransition] = useTransition();
  const navigate = useRouter();

  const formSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const res = await signIn("credentials", {
          email,
          password: values.password,
          redirect: false,
        });
        const { ok } = res as SignInResponse;
        if (!ok) {
          ErrorToast("Issue In Login");
          return;
        }
        successToast("Login Successfull");
        navigate.push("/dashboard");
      } catch (error: any) {
        toast.success("Issue In Login", {
          description: error.message,
          position: "bottom-right",
          duration: 3000,
          className: "bg-red-700 text-white border border-red-600",
          style: {
            backgroundColor: "#C1292E",
            color: "white",
            border: "1px solid #3E5692",
          },
        });
      }
    });
  }
  return (
    <div className="relative">
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
      <div className="">
        <div className="space-y-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-slate-700  flex items-center gap-2">
                      <Lock className="w-4 h-4 text-sky-600" />
                      Enter Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput {...field} className="" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-sky-700 font-gilRegular hover:text-sky-800 transition-colors cursor-pointer"
                  onClick={() => setAuthStep("forgot")}
                >
                  Forgot password?
                </button>
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
        </div>
      </div>
    </div>
  );
};

export default LoginPassword;
