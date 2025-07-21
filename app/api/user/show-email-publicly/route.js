import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Authentication Required!" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session?.user?.id },
      select: { showEmailPublicly: true }
    });

    const { showEmailPublicly } = await prisma.user.update({
      where: { id: session?.user?.id },
      data: { showEmailPublicly: !user?.showEmailPublicly },
      select: { showEmailPublicly: true }
    });

    return NextResponse.json({ message: "Success!", showEmailPublicly }, { status: 200 });
  } catch (error) {
    console.log('Error while updating show email publicly ', error);
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 });
  }
}