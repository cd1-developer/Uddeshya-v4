import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { email, z } from "zod";
import { ErrorToast } from "@/components/custom/ErrorToast";
import { useSendOtp } from "@/hooks/useSendOtp";
import { successToast } from "@/components/custom/SuccessToast";

interface ForgotPasswordProp {
  email: string;
  setAuthStep: React.Dispatch<
    React.SetStateAction<"email" | "login" | "create" | "forgot" | "otp">
  >;
}

const formSchema = z.object({
  email: z.email("Enter a valid email address"),
});

function ForgotPassword({ email, setAuthStep }: ForgotPasswordProp) {
  const { isPending, sendOtp } = useSendOtp();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Call the custom hook function
      const { success, message } = await sendOtp(values.email);

      // ❌ API-level failure
      if (!success) {
        ErrorToast(message || "OTP sending failed.");
        return;
      }

      // ✅ Success
      successToast(message || "OTP sent successfully");
      setAuthStep("otp");
    } catch (error: any) {
      // 🔥 Network / unexpected crash
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Unexpected error occurred while sending OTP.";

      ErrorToast(msg);
    }
  }

  return (
    <div className="space-y-8 text-center">
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
                      value={email || field.value}
                      className="h-10 text-xs font-gilRegular rounded-xl border-slate-200 focus:border-sky-500 focus:ring-blue-500/20 transition-all duration-200"
                    />
                  </FormControl>

                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-10 font-gilSemiBold bg-gradient-to-r from-sky-700 to-sky-900 hover:from-sky-800 hover:to-sky-900 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 tracking-[0.05rem] cursor-pointer"
          >
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Sending...
              </div>
            ) : (
              <span className="text-xs md:text-sm">Send Verification Code</span>
            )}
          </Button>

          {/* Back to Login */}
          <p className="text-xs text-slate-500 font-gilRegular">
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => setAuthStep("login")}
              className="text-sky-700 hover:underline font-gilSemiBold"
            >
              Back to Login
            </button>
          </p>
        </form>
      </Form>
    </div>
  );
}

export default ForgotPassword;
