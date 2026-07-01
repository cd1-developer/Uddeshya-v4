"use client";
import React from "react";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const Navbar = () => {
  // const status = session;
  const navigate = useRouter();

  return (
    <header className="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg mr-1">
                {/* <Calendar className="w-5 h-5 text-white" /> */}
                <img
                  className="w-15 h-15 object-cover"
                  src="/blue-logo.png"
                  alt="Uddeshya Logo"
                />
              </div>
              <h1 className="text-[1.2rem] font-bold text-sky-800 font-gilMedium uppercase mb-1.1">
                Uddeshya
              </h1>
            </div>
          </Link>

          {/* <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate.push("/LoginEmail")}
              className="w-full sm:w-auto font-gilLight h-10 px-8 text-sky-700 hover:bg-sky-700 hover:text-white font-semibold rounded-xl transition-all duration-200 shadow"
            >
              <LogIn /> Sign In
            </Button>
          </div> */}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
