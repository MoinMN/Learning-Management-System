import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Authentication Required!" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get("sessionId")?.value;

    const sessions = await prisma.sessionLog.findMany({ where: { userId: session?.user?.id } });

    return NextResponse.json({ message: "Success!", sessions, current: sessionId }, { status: 200 });
  } catch (error) {
    console.log('Error fetching sessions ', error);
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 });
  }
}