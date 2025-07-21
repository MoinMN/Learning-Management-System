import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Authentication required!" }, { status: 401 });
    }

    const { email, name, bio, number } = await req.json();

    if (!email || !name || !bio || !number) {
      return NextResponse.json({ message: "All Field Required!" }, { status: 400 });
    }

    // Validate email matches session
    if (email !== session.user.email) {
      return NextResponse.json({ message: "Unauthorized access!" }, { status: 403 });
    }

    // Validate phone number format (10 digits)
    if (number && !/^\d{10}$/.test(number)) {
      return NextResponse.json({ message: "Phone number must be 10 digits" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { email },
      data: {
        name,
        bio,
        number,
        updatedAt: new Date()
      },
    });

    return NextResponse.json({ message: "Updated Successfully!", user }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 });
  }
}