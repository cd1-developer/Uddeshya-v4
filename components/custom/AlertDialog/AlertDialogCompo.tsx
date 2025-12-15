import React from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface AlertDialogProp {
  triggerButton: React.ReactNode;
  description: React.ReactNode;
  isDisabled: boolean;
  onClickHandler: () => void;
  actionTitle: string;
  loader: string;
  children?: React.ReactNode;
  isLoading: boolean;
}

const AlertDialogCompo = ({
  triggerButton,
  description,
  isDisabled,
  onClickHandler,
  actionTitle,
  loader,
  children,
  isLoading,
}: AlertDialogProp) => {
  return (
    <div>
      <AlertDialog>
        <AlertDialogTrigger asChild>{triggerButton}</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-gilRegular">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-gilRegular">
              {description}
              {children}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-gilRegular cursor-pointer border border-black">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onClickHandler}
              disabled={isDisabled}
              className="text-white font-gilRegular cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {loader}
                </div>
              ) : (
                actionTitle
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AlertDialogCompo;
