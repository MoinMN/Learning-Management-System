import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Authentication required!" }, { status: 401 });
    }

    const settings = await prisma.notificationSetting.findUnique({ where: { userId: session.user.id } });

    return NextResponse.json({ message: "Successfully retrived!", settings }, { status: 200 });
  } catch (error) {
    console.error("Fetching Notification Setting Error:", error);
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 });
  }
}