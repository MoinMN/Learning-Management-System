import { generateWelcomeEmail } from "@/utility/templates";
import { NextResponse } from "next/server";
import sendMail from "@/utility/mail";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";

export async function POST(req) {
  const { email, name, password, otp } = await req.json();
  if (!email || !name || !password || !otp) {
    return NextResponse.json({ message: "All Fields Required!" }, { status: 400 });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists.' }, { status: 409 });
    }

    const otpVerify = await prisma.oTP.findUnique({ where: { email } });

    if (!otpVerify) return NextResponse.json({ message: 'OTP is not issued!' }, { status: 400 });

    if (otpVerify.code !== otp) {
      return NextResponse.json({ message: 'OTP not matched!' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // generate random username
    const randomString = Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map(byte => byte.toString(36).padStart(2, '0'))
      .join('')
      .slice(0, 6);

    const username = `user${randomString}`;


    // Create new user
    const user = await prisma.user.create({
      data: { email, username, name, password: hashedPassword, role: "SELLER", NotificationSetting: { create: {} } },
      include: { NotificationSetting: true, }
    });

    // send welcome mail
    const subject = "Welcome to LMS!";
    const dashboardLink = process.env.NEXTAUTH_URL + '/seller/dashboard';
    const helpLink = process.env.NEXTAUTH_URL + '/seller/dashboard';

    const html = generateWelcomeEmail(user.name, user.role, dashboardLink, helpLink);
    await sendMail({ to: user.email, subject, html });

    await prisma.oTP.delete({ where: { email } });

    // You can return the user, or just a success message
    return NextResponse.json({ message: 'User registered successfully.', user }, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ message: 'Internal server error!' }, { status: 500 });
  }
}