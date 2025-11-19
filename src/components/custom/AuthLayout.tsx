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
    <div className="min-h-screen relative overflow-hidden">
      {/* Doogal-style background elements */}
      {/* <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-indigo-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-100/40 to-slate-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-bl from-indigo-200/20 to-blue-300/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div> */}

      {/* Back button */}
      {/* <div className="absolute top-6 left-6 z-20">
        <Link href="/">
          <Button
            variant="ghost"
            className="text-slate-600 hover:text-white border hover:bg-gradient-to-r from-sky-600 to-sky-800 hover:from-sky-700 hover:to-sky-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <h2 className="hidden font-gilMedium md:flex">Back to Home</h2>
          </Button>
        </Link>
      </div> */}

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center p-4">
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
