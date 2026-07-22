import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'triploom_default_nextauth_secret_key_2026',
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing email or password in credentials');
          return null;
        }

        try {
          await dbConnect();
          const cleanEmail = credentials.email.trim().toLowerCase();
          const user = await User.findOne({ email: cleanEmail });

          if (!user) {
            console.log(`[Auth] No user found for email: ${cleanEmail}`);
            return null;
          }

          if (!user.passwordHash) {
            console.log(`[Auth] User ${cleanEmail} registered via OAuth (no passwordHash)`);
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isValid) {
            console.log(`[Auth] Invalid password for user: ${cleanEmail}`);
            return null;
          }

          console.log(`[Auth] Successfully authenticated user: ${cleanEmail}`);
          return {
            id: user._id.toString(),
            name: user.name || user.email,
            email: user.email,
            image: user.image || null,
          };
        } catch (error: any) {
          console.error('[Auth] Error during credentials authorization:', error?.message || error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await dbConnect();
          const cleanEmail = user.email?.trim().toLowerCase();
          let dbUser = await User.findOne({ email: cleanEmail });
          if (!dbUser) {
            dbUser = await User.create({
              name: user.name || '',
              email: cleanEmail,
              image: user.image || '',
              provider: 'google',
            });
          }
          user.id = dbUser._id.toString();
        } catch (error: any) {
          console.error('[Auth] Error in Google signIn callback:', error?.message || error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
