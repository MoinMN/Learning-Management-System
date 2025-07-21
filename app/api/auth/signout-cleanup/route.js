import { authOptions } from "../[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  if (!session?.user || !sessionId) {
    return NextResponse.json({ sucess: false }, { status: 400 });
  }

  try {
    // Delete only the current session log
    await prisma.sessionLog.deleteMany({
      where: { userId: session.user.id, id: sessionId, },
    });

    // Clean up cookie
    cookieStore.delete("sessionId");
    return NextResponse.json({ sucess: true }, { status: 200 });
  } catch (error) {
    console.log('Error while deleting session records ', error);
    return NextResponse.json({ sucess: false }, { status: 500 });
  }
}