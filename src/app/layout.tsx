import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "../../libs/ReduxProvider";
import NextAuthProvider from "../../libs/NextAuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>
          <Providers>{children}</Providers>
        </NextAuthProvider>
      </body>
    </html>
  );
}
