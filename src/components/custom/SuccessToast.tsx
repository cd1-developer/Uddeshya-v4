import { toast } from "sonner";
export const successToast = (message: string) => {
  toast.success(message, {
    position: "bottom-right",
    duration: 1500,
    className: "bg-green-700 text-white border border-green-600",
    style: {
      backgroundColor: "#285943",
      color: "white",
      border: "1px solid #3e5692",
    },
  });
};
