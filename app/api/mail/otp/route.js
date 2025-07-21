import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import sendMail from "@/utility/mail";
import { otpTemplate } from "@/utility/templates";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const { email } = (await getServerSession(authOptions))?.user || await req?.json();

    if (!email) {
      return NextResponse.json({ message: "Email not recevied!" }, { status: 401 });
    }

    const emailExisting = await prisma.oTP.findUnique({ where: { email } });

    // otp generate
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Current time in UTC
    const now = new Date();
    // Set expiry time 10 minutes from now (UTC)
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 min in ms

    if (emailExisting) {
      await prisma.oTP.update({
        where: { email },
        data: {
          code: otp,
          expiresAt,
        },
      });
    } else {
      await prisma.oTP.create({
        data: {
          email,
          code: otp,
          expiresAt,
        },
      });
    }

    // for sending email
    const subject = "Verify your email!";
    const digits = otp.split("");
    let html = otpTemplate
      .replace("{digit1}", digits[0])
      .replace("{digit2}", digits[1])
      .replace("{digit3}", digits[2])
      .replace("{digit4}", digits[3])
      .replace("{digit5}", digits[4])
      .replace("{digit6}", digits[5]);

    await sendMail({ to: email, subject, html });
    return NextResponse.json({ message: 'Email send successfully!' }, { status: 200 });
  } catch (error) {
    console.log('Error while sending otp and storing!', error);
    return NextResponse.json({ message: 'Internal server error!' }, { status: 500 });
  }
}