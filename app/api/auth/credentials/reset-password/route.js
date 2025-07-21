import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gte: new Date(),
        },
      },
    });

    if (!user) return NextResponse.json({ message: "Invalid or expired token!" }, { status: 401 });

    const hashPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashPassword,
        resetToken: null,
        resetTokenExpires: null,
      }
    });

    return NextResponse.json({ message: "Password Reset Successfully!" }, { status: 200 });
  } catch (error) {
    console.log('Error while resetting password ', error);
    return NextResponse.json({ message: "Interal Server Error!" }, { status: 500 });
  }
}