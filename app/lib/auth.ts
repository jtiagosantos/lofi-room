import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/app/lib/mongodb";
import { User } from "@/app/lib/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      try {
        await connectToDatabase();

        await User.findOneAndUpdate(
          { email: user.email },
          {
            name: user.name,
            email: user.email,
            image: user.image,
            provider: account?.provider,
            providerAccountId: account?.providerAccountId,
            accessToken: account?.access_token,
            refreshToken: account?.refresh_token,
            tokenType: account?.token_type,
            expiresAt: account?.expires_at,
            idToken: account?.id_token,
            scope: account?.scope,
            lastLoginAt: new Date(),
          },
          { upsert: true, new: true }
        );

        return true;
      } catch (error) {
        console.error("Erro ao salvar usuário no banco de dados:", error);
        return true;
      }
    },

    async jwt({ token }) {
      if (!token.userId && token.email) {
        try {
          await connectToDatabase();
          const user = await User.findOne({ email: token.email }).select("_id");
          if (user) {
            token.userId = user._id.toString();
          }
        } catch (error) {
          console.error("Erro ao buscar userId para o token:", error);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token.userId && session.user) {
        (session.user as { id?: string }).id = token.userId as string;
      }
      return session;
    },
  },
};
