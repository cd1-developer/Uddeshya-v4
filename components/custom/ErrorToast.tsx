import { toast } from "sonner";
// 🧩 Common toast style helper (DRY)
export const ErrorToast = (message: string) => {
  toast.error(message, {
    position: "bottom-right",
    duration: 3000,
    className: "bg-red-700 text-white border border-red-600",
    style: {
      backgroundColor: "#C1292E",
      color: "white",
      border: "1px solid #3e5692",
    },
  });
};
