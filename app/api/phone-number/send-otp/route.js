import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const servicesId = process.env.TWILIO_SERVICE_ID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

export async function POST(req) {
  try {
    const { phone } = await req.json();

    const verification = await client.verify.v2
      .services(servicesId)
      .verifications.create({
        to: `+91${phone}`,
        channel: "sms",
      });

    if (verification.status === "pending") {
      return NextResponse.json({ sent: true, message: "OTP sent successfully!" }, { status: 200 });
    } else {
      return NextResponse.json({ sent: false, message: "Internal Server Error!" }, { status: 400 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 });
  }
}