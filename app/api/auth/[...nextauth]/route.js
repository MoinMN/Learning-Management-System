import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { cookies, headers } from "next/headers";
import prisma from "@/lib/prisma";
import NextAuth from "next-auth";
import bcrypt from 'bcrypt';
import sendMail from "@/utility/mail";
import { generateWelcomeEmail } from "@/utility/templates";
import { parseDevice } from "@/lib/device";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          avatar: profile.avatar_url,
          provider: "github",
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          avatar: profile.picture,
          provider: "google",
        };
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Email" },
        password: { label: "Password", type: "password", placeholder: "Password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });

        if (user) {
          if (!user.password) return null;
          const passwordMatched = await bcrypt.compare(credentials?.password, user?.password);
          if (passwordMatched) {
            return {
              id: user.id,
              provider: user.provider,
              avatar: user.avatar,
              email: user.email,
              name: user.name,
              role: user.role
            };
          }
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // save user data when user is successfully login
      if (user && account) {
        token.provider = account.provider;

        const reqHeaders = await headers();
        const userAgent = reqHeaders.get("user-agent") || "";
        const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "UNKNOWN";

        if (account.provider === "credentials") {
          token.id = user.id;
          token.avatar = user.avatar;
          token.email = user.email;
          token.name = user.name;
          token.role = user.role;

          // fetch session 1st if exists and delete
          const existingSession = await prisma.sessionLog.findUnique({ where: { userId: user.id } });

          if (existingSession) {
            await prisma.sessionLog.delete({ where: { id: existingSession.id } });
          }

          // Fetch location using IP
          let location = '';
          try {
            const res = await fetch(`https://ipapi.co/${ip}/json/`, { method: "GET" });
            location = `${res.data.city}, ${res.data.region}, ${res.data.country_name}`;
          } catch (error) {
            console.log('Location fetch failed');
          }

          // Parse device and log session
          const { device, os, browser } = parseDevice(userAgent);
          const { id } = await prisma.sessionLog.create({
            data: {
              userId: user.id,
              ipAddress: ip,
              device,
              location,
              os,
              browser
            }
          });

          const cookieStore = await cookies();
          cookieStore.set("sessionId", id, { path: "/", httpOnly: true });
        }

        if (account.provider === "google" || account.provider === "github") {
          let userExist = await prisma.user.findUnique({ where: { email: user.email } });

          // retrive register as
          const registerAs = ((await cookies()).get("register_as"))?.value;

          // safe role filtering
          const safeRole = registerAs === "seller" ? "SELLER" : "VIEWER";
          if (!userExist) {
            // generate random username
            const randomString = Array.from(crypto.getRandomValues(new Uint8Array(4)))
              .map(byte => byte.toString(36).padStart(2, '0'))
              .join('')
              .slice(0, 6);

            const username = `user${randomString}`;

            await prisma.user.create({
              data: {
                username,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                provider: account.provider,
                role: safeRole,
                NotificationSetting: { create: {} }
              },
              include: { NotificationSetting: true },
            });
            // send welcome mail
            const subject = "Welcome to LMS!";
            const html = generateWelcomeEmail(user.name, safeRole, process.env.NEXTAUTH_URL, process.env.NEXTAUTH_URL);
            await sendMail({ to: user.email, subject, html });
          }

          // reterive data to store on token
          userExist = await prisma.user.findUnique({ where: { email: user.email } });

          token.id = userExist.id;
          token.avatar = userExist.avatar;
          token.email = userExist.email;
          token.name = userExist.name;
          token.role = userExist.role;

          // fetch 1st if exists and delete
          const existingSession = await prisma.sessionLog.findUnique({ where: { userId: userExist.id } });

          if (existingSession) {
            await prisma.sessionLog.delete({ where: { id: existingSession.id } });
          }

          // Fetch location using IP
          let location = '';
          try {
            const res = await fetch(`https://ipapi.co/${ip}/json/`, { method: "GET" });
            location = `${res.data.city}, ${res.data.region}, ${res.data.country_name}`;
          } catch (error) {
            console.log('Location fetch failed');
          }

          const { device, os, browser } = parseDevice(userAgent);
          const { id } = await prisma.sessionLog.create({
            data: {
              userId: userExist.id,
              ipAddress: ip,
              os,
              browser,
              device,
              location
            }
          });

          const cookieStore = await cookies();
          cookieStore.set("sessionId", id, { path: "/", httpOnly: true });
        }
      }
      return token;
    },
    async session({ session, token }) {
      const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });

      if (dbUser) {
        session.user.id = dbUser.id;
        session.user.username = dbUser.username;
        session.user.name = dbUser.name;
        session.user.email = dbUser.email;
        session.user.avatar = dbUser.avatar;
        session.user.bio = dbUser.bio;
        session.user.number = dbUser.number;
      }
      return session;
    },
    async signIn({ user }) {
      const existingUser = await prisma.user.findUnique({ where: { id: user?.id } });
      if (existingUser?.markedForDeletion) {
        await prisma.user.update({
          where: { email: user.email },
          data: {
            markedForDeletion: false,
            deletionScheduledAt: null
          }
        });
      }
      return true
    }
  },
}

export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);