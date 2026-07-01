import { useState } from "react";
import axios from "axios";

export function useSendOtp() {
  const [isPending, setIsPending] = useState(false);

  async function sendOtp(email: string) {
    setIsPending(true);

    try {
      // ⏳ API call
      const res = await axios.post("/api/auth/sendOtp", { email });
      const { success, message, userId } = res.data;

      if (!success) {
        return { success, message };
      }

      // Store user id for verifying OTP
      localStorage.setItem("userId", userId);

      return { success: true, message: "OTP sent successfully" };
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong while sending OTP";

      return { success: false, message: msg };
    } finally {
      setIsPending(false);
    }
  }

  return {
    sendOtp,
    isPending,
  };
}
