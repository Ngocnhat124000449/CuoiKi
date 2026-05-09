import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = (auth?.user as { isAdmin?: boolean })?.isAdmin;

      if (nextUrl.pathname.startsWith('/admin')) {
        if (!isLoggedIn) return false;
        if (!isAdmin) return Response.redirect(new URL('/', nextUrl));
        return true;
      }

      if (nextUrl.pathname.startsWith('/account')) {
        return isLoggedIn;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      (session.user as { isAdmin?: boolean }).isAdmin = (token.isAdmin as boolean) ?? false;
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
