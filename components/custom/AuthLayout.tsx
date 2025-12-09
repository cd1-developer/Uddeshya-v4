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
}
function AuthLayout({
  header,
  title,
  children,
  navigator,
  navigateTo,
  navigateTitle,
}: AuthLayoutType) {
  return (
    <div className="relative">
      {/* Main content */}
      <div className=" flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg">
              {/* <Calendar className="w-8 h-8 text-white animate-pulse" /> */}
              <img
                className="w-18 h-18 object-cover"
                src="/blue-logo.png"
                alt="Uddeshya Logo"
              />
            </div>
            <h1 className="text-3xl text-slate-800 mb-2 font-gilSemiBold">
              {header}
            </h1>
            <p className="text-slate-600 font-gilRegular">{title}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            {children}
            <div className="mt-6 text-center">
              <p className="text-slate-600 font-gilMedium">
                {navigateTitle}
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
          <div className="text-center mt-8 text-sm font-gilMedium text-slate-500">
            <p>Secure • Reliable • Professional</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
