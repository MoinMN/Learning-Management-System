import { resetPassword } from "@/utility/templates";
import { NextResponse } from "next/server";
import sendMail from "@/utility/mail";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user && !otp) return NextResponse.json({ message: "Email ID & OTP Not Found!" }, { status: 401 });

    const actualOtp = (await prisma.oTP.findUnique({ where: { email }, select: { code: true } })).code;

    if (actualOtp !== otp) {
      return NextResponse.json({ message: "Incorrect OTP!" }, { status: 400 });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpires: expiry,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    const subject = "Reset your password!";
    const html = resetPassword.replace("{user_name}", user?.name).replace("{reset_link}", resetUrl)

    await sendMail({ to: email, subject, html });

    await prisma.oTP.delete({ where: { email } });

    return NextResponse.json({ message: "Reset Link is sent to register email id!" }, { status: 200 });
  } catch (error) {
    console.log('Error while sending reset link ', error);
    return NextResponse.json({ message: "Interal Server Error!" }, { status: 500 });
  }
}