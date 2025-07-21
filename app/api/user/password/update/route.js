import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Authentication required!" }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmNewPassword } = await req.json();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return NextResponse.json({ message: "All Fields Required!" }, { status: 401 });
    }

    if (newPassword !== confirmNewPassword) {
      return NextResponse.json({ message: "Confirm New Password Doesn't Matched!" }, { status: 401 });
    }

    const actualPassword = (await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    })).password;

    const isMatched = await bcrypt.compare(currentPassword, actualPassword);

    if (!isMatched) {
      return NextResponse.json({ message: "Invalid Credentials!" }, { status: 401 });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({ where: { id: session.user.id }, data: { password: hashedNewPassword } });

    return NextResponse.json({ message: "Password Updated Successfully!" }, { status: 200 });
  } catch (error) {
    console.log('Error changing password ', error);
    return NextResponse.json({ message: "Internal Server Error, Try Again Later!" }, { status: 500 });
  }
}