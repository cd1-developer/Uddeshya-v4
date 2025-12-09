import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/libs/ReduxProvider";
import NextAuthProvider from "@/libs/NextAuthProvider";
import { Toaster } from "@/components/ui/sonner";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </NextAuthProvider>
      </body>
    </html>
  );
}
