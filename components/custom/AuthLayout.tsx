import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";

interface AuthLayoutType {
  header: string;
  title: string;
  navigator: string;
  navigateTo: string;
  navigateTitle: string;
  children: React.ReactNode;
  backButton?: React.ReactNode;
}
function AuthLayout({
  header,
  title,
  children,
  navigator,
  navigateTo,
  navigateTitle,
  backButton,
}: AuthLayoutType) {
  return (
    <div className="h-full">
      {/* Main content */}

      <div className="flex items-center justify-center p-4">
        {backButton && (
          <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
            {backButton}
          </div>
        )}
        <div className="w-full max-w-md mt-18 sm:mt-28">
          {/* Header */}
          <div className="text-center bg mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg">
              {/* <Calendar className="w-8 h-8 text-white animate-pulse" /> */}
              <img
                className="w-18 h-18 object-cover"
                src="/blue-logo.png"
                alt="Uddeshya Logo"
              />
            </div>
            <h1 className="text-xl md:text-2xl text-slate-800 font-gilSemiBold">
              {header}
            </h1>
            <p className="text-slate-600 font-gilRegular text-xs md:text-base text-center">
              {title}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4">
            {children}
            <div className="mt-6 text-center">
              <p className="text-slate-600 font-gilMedium">
                <span className="text-xs md:text-sm">{navigateTitle}</span>
                <Link
                  href={navigator}
                  className="text-sky-600 hover:sky-blue-800 font-gilSemiBold transition-colors"
                >
                  {navigateTo}
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs mt-8 md:text-sm font-gilMedium text-slate-500">
            <p>Secure • Reliable • Professional</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
