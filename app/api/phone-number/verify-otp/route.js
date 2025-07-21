import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const servicesId = process.env.TWILIO_SERVICE_ID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

export async function POST(req) {
  try {
    const { phone, otp } = await req.json();

    const verificationCheck = await client.verify.v2
      .services(servicesId)
      .verificationChecks.create({
        code: otp,
        to: `+91${phone}`,
      });

    if (verificationCheck.status === "approved") {
      return NextResponse.json({ success: true, message: "OTP Verified!" }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, message: "Internal Server Error!" }, { status: 400 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 });
  }
}