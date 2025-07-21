import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Authentication Required!" }, { status: 400 });
    }

    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { userId: session.user.id }
    });

    return NextResponse.json({ message: "Success!", verificationRequest }, { status: 200 });
  } catch (error) {
    console.log('Error while requesting verification ', error);
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 });
  }
}