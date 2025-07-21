import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if(!session?.user){
      return NextResponse.json({ message: "Authentication Required!" }, { status: 401 });
    }

    

  } catch (error) {
    console.log('Error while fetching payment history! ', error);
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 });
  }
}