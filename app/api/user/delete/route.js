import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Authentication required!" }, { status: 401 });
    }

    const url = new URL(req.url);
    const otp = url.searchParams.get("otp");

    const actualOtp = (await prisma.oTP.findUnique({
      where: { email: session?.user?.email },
      select: { code: true }
    })).code;

    if (otp !== actualOtp) {
      return NextResponse.json({ message: "Invalid OTP!" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session?.user?.id },
      data: {
        markedForDeletion: true,
        deletionScheduledAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    });

    return NextResponse.json({ message: 'Account scheduled for deletion in 30 days' }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 });
  }
}