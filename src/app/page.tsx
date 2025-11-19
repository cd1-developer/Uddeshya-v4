"use client";
import Link from "next/link";
import { Calendar, ArrowRight, Shield, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Navbar from "@/components/layout/Navbar/Navbar";
import LoginEmail from "./Login/LoginEmail/page";
// import { removeState } from "@/libs/dataslice";

export default function HomePage() {
  const dispatch = useDispatch();

  useEffect(() => {
    // dispatch(removeState());
  }, []);
  return (
    <div className="min-h-screen  relative overflow-hidden">
      <Navbar />
      {/* Doogal-style background elements */}
      {/* <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-sky-200/30 to-indigo-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-sky-100/40 to-slate-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-bl from-indigo-200/20 to-sky-300/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div> */}
      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 main">
        <div className="w-full max-w-4xl text-center">
          <LoginEmail />

          {/* Header */}
          {/* <div className="mb-12">
            <h1 className="text-5xl text-slate-800 mb-4 font-gilBold uppercase">
              Simplify Leave Management with{" "}
              <span className="text-sky-700">UDDESHYA</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto font-gilRegular">
              Streamline your organization's leave requests, approvals, and
              reporting with our comprehensive leave management system designed
              for modern workplaces.
            </p>
          </div> */}

          {/* Features */}
          {/* <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <Shield className="w-8 h-8 text-sky-600 mb-4 mx-auto" />
              <h3 className="text-lg text-slate-800 mb-2 font-gilSemiBold">
                Secure & Reliable
              </h3>
              <p className="text-slate-600 font-gilRegular">
                Enterprise-grade security with reliable uptime for your peace of
                mind.
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <Clock className="w-8 h-8 text-sky-600 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2 font-gilSemiBold">
                Real-time Tracking
              </h3>
              <p className="text-slate-600 font-gilRegular">
                Track leave balances, requests, and approvals in real-time.
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <Users className="w-8 h-8 text-sky-600 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2 font-gilSemiBold">
                Team Collaboration
              </h3>
              <p className="text-slate-600 font-gilRegular">
                Seamless collaboration between employees and managers.
              </p>
            </div>
          </div> */}

          {/* CTA Buttons */}
          {/* <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/LoginEmail">
              <Button className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-sky-600 to-sky-800 hover:from-sky-700 hover:to-sky-900 text-white font-gilSemiBold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
                Sign In
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/Signup">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-12 px-8 border-2 border-sky-600 text-sky-600 hover:bg-sky-600 hover:text-white font-gilSemiBold rounded-xl transition-all duration-200"
              >
                Create Account
              </Button>
            </Link>
          </div> */}

          {/* Footer */}
          {/* <div className="mt-12 text-sm text-slate-500 font-gilMedium">
            <p>Trusted by teams worldwide • Secure • Professional</p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
