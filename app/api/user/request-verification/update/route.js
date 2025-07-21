import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PUT() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Authentication Required!" }, { status: 400 });
    }

    // Check if a request already exists
    const existingRequest = await prisma.verificationRequest.findFirst({ where: { userId: session.user.id } });

    if (existingRequest) {
      if (existingRequest?.status === "PENDING") {
        return NextResponse.json({ message: "Verification request already submitted." }, { status: 200 });
      }
      if (existingRequest?.status === "REJECTED") {
        await prisma.verificationRequest.update({
          where: { userId: session.user.id },
          data: { status: "PENDING", note: "Applied For Re-Verification!" },
        });
        return NextResponse.json({ message: "Verification request re-submitted." }, { status: 200 });
      }
    }

    // Create a new request
    await prisma.verificationRequest.create({
      data: { userId: session.user.id, note: "User requested verification", },
    });

    return NextResponse.json({ message: "Verification request submitted." }, { status: 201 });
  } catch (error) {
    console.log('Error while requesting verification ', error);
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 });
  }
}