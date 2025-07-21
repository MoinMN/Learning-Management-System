import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Authentication Required!" }, { status: 401 });
    }

    const courses = await prisma.course.findMany({ where: { instructorId: session?.user?.id } });

    return NextResponse.json({ message: "Success!", courses }, { status: 200 });
  } catch (error) {
    console.log('Error while fetching payment history! ', error);
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 });
  }
}