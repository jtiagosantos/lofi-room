import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/app/lib/mongodb";
import { User } from "@/app/lib/models/User";

const handler = NextAuth({
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
  },
});

export { handler as GET, handler as POST };
