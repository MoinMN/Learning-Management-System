import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(req) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json({ success: false, message: "Vendor Id not received!", }, { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Authentication Required!", }, { status: 401 });
    }

    const accountDetails = await prisma.paymentAccount.findMany({ where: { userId: session?.user?.id } });

    const targetAccount = accountDetails.find((acc) => acc.vendorId === vendorId);

    if (!targetAccount) {
      return NextResponse.json({ success: false, message: "Unauthorized Request!", }, { status: 401 });
    }

    if (targetAccount.status !== "ACTIVE") {
      return NextResponse.json({ success: false, message: "Account must be ACTIVE to set as primary." }, { status: 400 });
    }

    // Set all others to false, and this one to true
    const updates = [];

    for (const acc of accountDetails) {
      updates.push(
        prisma.paymentAccount.update({
          where: { id: acc.id },
          data: {
            isPrimary: acc.vendorId === vendorId
          }
        })
      );
    }

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: "Primary account updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error while toggle primary account:", error?.response?.data || error);
    return NextResponse.json({ success: false, message: error.message, }, { status: 500 });
  }
}