import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Authentication required!" }, { status: 401 });
    }

    const accounts = await prisma.paymentAccount.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ message: "Success!", accounts }, { status: 200 });
  } catch (error) {
    console.error("Account details get:", error?.response?.data || error);
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 });
  }
}