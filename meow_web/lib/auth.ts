import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb-client"; // Need to create this for the adapter

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("[Auth] Authorize called with email:", credentials?.email);
        try {
          await dbConnect();
          console.log("[Auth] DB Connected successfully");
          
          const user = await User.findOne({ email: credentials?.email });
          console.log("[Auth] User found in DB:", user ? "Yes" : "No");
          
          if (user && user.password && credentials?.password) {
            const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);
            console.log("[Auth] Password match result:", isPasswordMatch);
            if (isPasswordMatch) {
              return user;
            }
          }
          console.log("[Auth] Invalid credentials or password mismatch");
          return null;
        } catch (error) {
          console.error("[Auth] Error in authorize function:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
