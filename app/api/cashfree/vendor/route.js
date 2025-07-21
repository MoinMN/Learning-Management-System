import createPayment from "@/app/api/account/create/createPayment";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// get vendor details
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json({ message: "Vendor Id not received!", }, { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Authentication Required!", }, { status: 401 });
    }

    const accountDetails = await prisma.paymentAccount.findMany({ where: { userId: session?.user?.id } });

    let vendorIdExist = false;
    accountDetails.forEach((acc) => {
      if (acc.vendorId === vendorId) {
        vendorIdExist = true;
      }
    });

    if (!vendorIdExist) {
      return NextResponse.json({ message: "Unauthorized Request!", }, { status: 401 });
    }

    const options = {
      method: 'GET',
      headers: {
        'x-api-version': '2025-01-01',
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET,
      },
    };

    const domain = process.env.NODE_ENV === "development" ? "sandbox" : "api";
    const response = await fetch(`https://${domain}.cashfree.com/pg/easy-split/vendors/${vendorId}`, options);

    const result = await response.json();

    if (result?.status === 'ACTIVE') {
      const allAccountDetails = await prisma.paymentAccount.findMany({ where: { userId: session.user.id } });
      const hasPrimary = allAccountDetails.some((acc) => acc.isPrimary);
      if (!hasPrimary) {
        await prisma.paymentAccount.update({
          where: { userId: session.user.id, vendorId },
          data: { isPrimary: true }
        });
      }
    }

    await prisma.paymentAccount.update({
      where: { userId: session?.user?.id, vendorId },
      data: {
        status: result?.status,
      }
    });

    const updatedData = await prisma.paymentAccount.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ message: "Refreshed!", data: updatedData }, { status: 200 });
  } catch (error) {
    console.error("Error while retriving status:", error?.response?.data || error);
    return NextResponse.json({ message: error.message, }, { status: 500 });
  }
}

// create new vendor
export async function POST(req) {
  const { accountHolderName, accountNumber, ifscCode, uidai, pan, upiId } = await req.json();

  if (!accountHolderName || !uidai || !pan || !(accountNumber && ifscCode) && !upiId) {
    return NextResponse.json({ success: false, message: "All Field Required!" }, { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Authentication required!" }, { status: 401 });
    }
    if (!session?.user?.number) {
      return NextResponse.json({ success: false, message: "Phone Number Required!" }, { status: 401 });
    }

    const vendorId = `VENDOR_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const data = {
      vendor_id: vendorId,
      name: accountHolderName,
      email: session?.user?.email,
      status: "ACTIVE",
      phone: session?.user?.number,
      dashboard_access: false,
      verify_account: true,
      settlement_config: {
        settlement_cycle: "DAILY"
      },
      kyc_details: {
        account_type: "Individual",
        business_type: "Education",
        uidai,
        pan,
      },
      // Only include bank or upi depending on what's provided
      ...(accountNumber && ifscCode
        ? {
          bank: {
            account_holder: accountHolderName,
            account_number: accountNumber,
            ifsc: ifscCode,
          },
        }
        : upiId
          ? {
            upi: {
              vpa: upiId,
              account_holder: accountHolderName,
            },
          }
          : {})
    };

    const options = {
      method: 'POST',
      headers: {
        'x-api-version': '2025-01-01',
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    };

    const domain = process.env.NODE_ENV === "development" ? "sandbox" : "api";
    const response = await fetch(`https://${domain}.cashfree.com/pg/easy-split/vendors`, options);

    const result = await response.json();
    console.log(result);
    if (!response?.ok) {
      return NextResponse.json({
        success: false,
        message: result.message || "Vendor creation failed at Cashfree."
      }, { status: 400 });
    }

    const isCreated = await createPayment(result, session.user.id);

    if (!isCreated) {
      return NextResponse.json({ success: false, message: "Error saving into database!" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Request Submitted Successfully!" }, { status: 201 });
  } catch (error) {
    console.error("Cashfree Order Error:", error?.response?.data || error);
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 });
  }
}
