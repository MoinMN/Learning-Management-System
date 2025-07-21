import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import cloudinary from "@/config/cloudinary";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const DEFAULT_AVATAR_URL = "https://res.cloudinary.com/dgu6xwnzx/image/upload/v1749624192/LMS/Profile_Image/oo1kwuf2jmfgednphxxf.jpg";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ message: "No file uploaded!" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Authentication required!" }, { status: 401 });
    }

    // Fetch the existing user avatar
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { avatar: true },
    });

    // If existing avatar is not default, delete it
    if (existingUser.avatar && !existingUser.avatar.includes(DEFAULT_AVATAR_URL)) {
      // Extract public_id from Cloudinary URL
      const segments = existingUser.avatar.split("/");
      const publicIdWithExtension = segments.slice(-1)[0];
      const publicId = `LMS/Profile_Image/${publicIdWithExtension.split(".")[0]}`;

      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.warn("Cloudinary destroy failed:", err.message);
      }
    }

    // Upload new avatar
    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "LMS/Profile_Image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Save the new avatar URL to the DB
    await prisma.user.update({
      where: { email: session.user.email },
      data: { avatar: uploadResult.secure_url },
    });

    return NextResponse.json({ message: "Avatar Uploaded Successfully!" }, { status: 200 });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 });
  }
}
