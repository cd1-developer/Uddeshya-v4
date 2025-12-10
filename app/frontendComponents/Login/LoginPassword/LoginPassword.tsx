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
import { useTransition } from "react";
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
    React.SetStateAction<"email" | "login" | "create">
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
    <>
      {/* Password form content */}
      <div className="w-full">
        <div className="">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-slate-700  flex items-center gap-2">
                      <Lock className="w-4 h-4 text-sky-600" />
                      <span className="text-sm">Enter Password</span>
                    </FormLabel>
                    <FormControl>
                      <PasswordInput {...field} className="text-xs" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-xs md:text-sm text-sky-700 font-gilRegular hover:text-sky-800 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full mt-5 h-10 font-gilRegular bg-gradient-to-r from-sky-700 to-sky-900 hover:from-sky-800 hover:to-sky-900 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 tracking-[0.05rem] cursor-pointer"
              >
                <h2>
                  {isPending ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full text-xs md:text-sm animate-spin mr-2"></div>
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
        </div>
      </div>
    </>
  );
};

export default LoginPassword;
