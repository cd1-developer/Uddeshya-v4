import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
interface DialogCompoType {
  isOpen: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  title?: string;
  discription?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}
function DialogCompo({
  isOpen,
  title,
  onOpenChange,
  discription,
  children,
  icon,
  className,
}: DialogCompoType) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`w-full rounded-xl ${className ?? ""}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 font-gilSemiBold">
            {icon}
            <span className="text-2xl">{title}</span>
          </DialogTitle>
          <DialogDescription className="font-gilRegular">
            {discription}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export default DialogCompo;
