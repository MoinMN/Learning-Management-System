import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Authentication required!" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const value = searchParams.get("value");

    if (!key || value === null) {
      return NextResponse.json({ message: "key & value not received!" }, { status: 401 });
    }

    // Convert value to boolean (since all your fields in NotificationSetting are boolean)
    const booleanValue = value === "true";

    const settings = await prisma.notificationSetting.update({
      where: { userId: session.user.id },
      data: {
        [key]: booleanValue,
      }
    });

    return NextResponse.json({ message: "Successfully Updated!", settings }, { status: 200 });
  } catch (error) {
    console.error("Fetching Notification Setting Error:", error);
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 });
  }
}