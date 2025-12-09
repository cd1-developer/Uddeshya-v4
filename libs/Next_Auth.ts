import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { LoginHandler } from "@/helper/loginHandler";
import axios from "axios";

export const Next_Auth: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "John@example.com",
        },

        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      async authorize(credentials: any) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          const response = await LoginHandler(
            credentials.email,
            credentials.password
          );

          const { success, message, user } = response;

          if (!success || !user) {
            throw new Error(message || "Invalid credentials");
          }

          return {
            id: user.id,
            email: user.email,
            username: user.username,
          };
        } catch (error: any) {
          console.error("Authorize Error:", error);

          if (axios.isAxiosError(error)) {
            // If server returned a JSON response with message
            const serverMsg = error.response?.data?.message;
            throw new Error(serverMsg || "Unable to login. Try again later.");
          }

          throw new Error(error?.message || "Authentication failed");
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 🕐 1 hour session expiry (in seconds)
  },
  jwt: {
    maxAge: 60 * 60, // 🕐 1 hour session expiry (in seconds)
  },
  callbacks: {
    jwt: ({ token, user }) => {
      // Persist user data to the token right after sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    session: ({ session, token }) => {
      // Send user properties to the client
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }

      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
