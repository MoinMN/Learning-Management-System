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

    const user = await prisma.user.findUnique({
      where: { email: session?.user?.email },
      select: {
        id: true,
        email: true,
        number: true,
        name: true,
        // password: true,
        role: true,
        avatar: true,
        bio: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
        // resetToken: true,
        // resetTokenExpires: true,
        isTwoStepAuthOn: true,
        isVerified: true,
        isBanned: true,
        Courses: true,
        Enrollments: true,
        Progress: true,
        Reviews: true,
        Payments: true,
        PaymentAccounts: true,
      }
    });
    return NextResponse.json({ message: "Success!", user }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 });
  }
}