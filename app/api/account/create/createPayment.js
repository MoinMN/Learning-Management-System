import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

const createPayment = async (result, sessionUserId) => {
  try {
    const {
      vendor_id,
      bank,
      upi,
      kyc_details,
    } = result;

    const hashedUidai = kyc_details?.uidai ? await bcrypt.hash(kyc_details?.uidai, 10) : null;
    const hashedPan = await bcrypt.hash(kyc_details?.pan, 10);

    await prisma.paymentAccount.create({
      data: {
        userId: sessionUserId,
        vendorId: vendor_id,
        accountNumber: bank?.account_number || null,
        accountHolderName: bank?.account_holder || upi?.account_holder,
        ifscCode: bank?.ifsc || null,
        upiId: upi?.vpa || null,
        uidai: hashedUidai,
        pan: hashedPan,
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error("Error creating payment account:", error.message);
    return false;
  }
};

export default createPayment;
