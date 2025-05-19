import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '../db';
import { account } from '../schema';
import { eq } from 'drizzle-orm';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const user = await db
          .select()
          .from(account)
          .where(eq(account.businessEmail, credentials.email))
          .then(rows => rows[0]);

        if (!user || user.password !== credentials.password) {
          throw new Error('Invalid credentials');
        }

        return user;
      },
    }),
  ],

  callbacks: {
  async signIn({ user, account: loginAccount }) {
    if (loginAccount.provider === "google") {
      let existingUser = await db
        .select()
        .from(account)
        .where(eq(account.businessEmail, user.email))
        .then(rows => rows[0]);

      if (!existingUser) {
        const insertedUsers = await db.insert(account).values({
          businessEmail: user.email,
          password: "", // Placeholder since Google auth doesn't use a password
        }).returning({ userId: account.userId });

        existingUser = insertedUsers[0];
      }

      user.userId = existingUser.userId;  // Ensure userId is set here
    }
    return true;
  },
  async jwt({ token, user }) {
    if (user) {
      token.id = user.userId; // Make sure to store userId in JWT
      token.email = user.businessEmail || user.email;
    }
    return token;
  },

  async session({ session, token }) {
    if (token) {
      session.user.id = token.id; // Ensure numeric ID is available in the session
      session.user.email = token.email;
    }
    return session;
  },
},

  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
};

export default NextAuth(authOptions);