import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  // 1. Definice poskytovatele autentizace
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      // 2. Samotná verifikace vůči databázi
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Hledání uživatele podle unikátního jména
        const user = await prisma.user.findUnique({
          where: { name: credentials.username }
        });

        if (!user) {
          return null; 
        }

        // Kryptografické porovnání plain-text hesla a uloženého hashe
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // Návrat dat, která se vloží do JWT 
        return {
          id: user.id.toString(),
          name: user.name,
        };
      }
    })
  ],
  // 3. Konfigurace relace a JWT
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // Propagace ID z uživatelského objektu do tokenu
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // Propagace ID z tokenu přímo do klientské relace
    async session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  // 4. Systémové cesty
  pages: {
    signIn: '/login', // Definuje, kam přesměrovat neautentizovaný požadavek
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);