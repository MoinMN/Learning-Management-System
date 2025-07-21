import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { cloudinary } from "@/config/cloudinary";
import prisma from "@/lib/prisma";
import { supabaseAdmin } from "@/config/supabase";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) return NextResponse.json({ message: "Authentication Required!" }, { status: 401 });

    const url = new URL(req.url);
    const title = url.searchParams.get("title");
    const decodeTitle = decodeURIComponent(title.replace(/\+/g, " "));

    if (!title) return NextResponse.json({ message: "Title Required!" }, { status: 400 });

    const course = await prisma.course.findUnique({
      where: { title_instructorId: { instructorId: session.user.id, title: decodeTitle } },
      include: {
        instructor: { select: { id: true, name: true, email: true, avatar: true, } },
        Chapters: { orderBy: { order: "asc" } },
      }
    });

    if (!course) return NextResponse.json({ message: "Course Not Found!" }, { status: 400 });

    return NextResponse.json({ message: "Success!", course }, { status: 200 });
  } catch (error) {
    console.log('Error while fetching course data! ', error);
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Authentication required!" }, { status: 401 });
    }

    const formData = await req.formData();

    const { valid, message, status, title, description, category, validityDays, isPaid, thumbnail, totalPrice, actualPrice } = validatedFormData(formData);

    if (!valid) return NextResponse.json({ message }, { status });

    if (
      !title ||
      !description ||
      !category ||
      !status ||
      !thumbnail ||
      (isPaid === "true" && (totalPrice === null || actualPrice === null))
    ) {
      return NextResponse.json({ message: "All Field are mandatory!" }, { status: 400 });
    }

    const isTitleExist = await prisma.course.findUnique({
      where: { title_instructorId: { instructorId: session.user.id, title: title } },
      select: { title: true }
    });

    if (isTitleExist) {
      return NextResponse.json({ message: "Title Already Used!" }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        title, description, category, status, validityDays,
        totalPrice: isPaid ? totalPrice : null,
        actualPrice: isPaid ? actualPrice : null,
        isPaid: isPaid === "true",
        instructorId: session.user.id,
      }
    });

    // Upload thumbnail
    const buffer = Buffer.from(await thumbnail.arrayBuffer());

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: `LMS/Courses/${session.user.username}/${course.id}` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    await prisma.course.update({ where: { id: course.id }, data: { thumbnail: uploadResult.secure_url } });

    return NextResponse.json({ message: "Course Successfully Created!" }, { status: 201 });
  } catch (error) {
    console.error("Course creating error: ", error);
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Authentication Required!" }, { status: 401 });
    }

    const formData = await req.formData();
    const id = formData.get('id');

    const { valid, message, status, title, description, category, validityDays, isPaid, thumbnail, totalPrice, actualPrice } = validatedFormData(formData);

    if (!valid) return NextResponse.json({ message }, { status });
    console.log(status)
    if (
      !id ||
      !title ||
      !description ||
      !category ||
      !thumbnail ||
      (status === "PUBLISHED" && status === "UNPUBLISHED") ||
      (isPaid === "true" && (totalPrice === null || actualPrice === null))
    ) {
      return NextResponse.json({ message: "All field are mandatory!" }, { status: 400 });
    }

    const isTitleExist = await prisma.course.findUnique({
      where: { title_instructorId: { instructorId: session.user.id, title } }
    });

    if (isTitleExist && isTitleExist.id !== id) {
      return NextResponse.json({ message: "Title already in use!" }, { status: 400 });
    }

    const existingCourse = await prisma.course.findUnique({ where: { id } });

    if (!existingCourse) return NextResponse.json({ message: "Course Not Found!" }, { status: 404 });

    let uploadResult = null;
    if (!(typeof thumbnail === 'string')) {
      // first delete previous thumbnail
      const segments = existingCourse.thumbnail.split("/");
      const publicIdWithExtension = segments.slice(-1)[0];
      const publicId = `LMS/Courses/${session.user.username}/${id}/${publicIdWithExtension.split(".")[0]}`;

      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.warn("Cloudinary destroy failed:", err.message);
      }

      // upload new thumbnail
      const buffer = Buffer.from(await thumbnail.arrayBuffer());

      uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: `LMS/Courses/${session.user.username}/${id}` },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        title, description, status, totalPrice, actualPrice, validityDays,
        isPaid: isPaid === "true",
        ...(uploadResult !== null && { thumbnail: uploadResult.secure_url })
      }
    });

    await prisma.chapter.updateMany({ where: { courseId: id }, data: { status: course.status } });

    return NextResponse.json({ message: "Course Updated Successfully!", course }, { status: 200 });
  } catch (error) {
    console.log('Error while updating course data! ', error);
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Authentication Required!" }, { status: 401 });
    }

    const url = new URL(req.url);
    const title = url.searchParams.get("title");
    const otp = url.searchParams.get("otp");

    if (!title || !otp) return NextResponse.json({ message: "Title and OTP Required!" }, { status: 400 });

    const isOTPMatched = await prisma.oTP.findUnique({ where: { email: session.user.email, code: otp } });

    if (!isOTPMatched) return NextResponse.json({ message: "Invalid OTP!" }, { status: 401 });

    const existingCourse = await prisma.course.findUnique({
      where: { title_instructorId: { instructorId: session.user.id, title } },
      include: { Chapters: true }
    });

    if (!existingCourse) return NextResponse.json({ message: "Course Not Found!" }, { status: 404 });

    // First delete all chapters and their resources
    if (existingCourse.Chapters && existingCourse.Chapters.length > 0) {
      const filesToDelete = [];
      for (const chapter of existingCourse.Chapters) {
        // push video url to delete
        if (chapter?.videoUrl) filesToDelete.push(chapter.videoUrl);
        // push PDF url to delete
        if (chapter?.pdfUrl) filesToDelete.push(chapter.pdfUrl);
      }

      if (filesToDelete.length > 0) {
        const { error: deleteError } = await supabaseAdmin.storage.from('courses').remove(filesToDelete);
        if (deleteError) {
          console.error('Supabase delete error:', deleteError);
          // Continue with deletion even if file deletion fails
        }
      }

      // Delete all chapters in bulk
      await prisma.chapter.deleteMany({ where: { courseId: existingCourse.id } });
    }

    if (existingCourse?.thumbnail) {
      try {
        // Delete all resources in the folder
        const folderPath = `LMS/Courses/${session.user.username}/${existingCourse.id}`;

        // 1. List all resources in the folder
        const { resources } = await cloudinary.api.resources({
          type: 'upload', prefix: folderPath, max_results: 500
        });

        // 2. Delete each resource
        const deletePromises = resources.map(resource => cloudinary.uploader.destroy(resource.public_id));
        await Promise.all(deletePromises);

        // 3. Delete the empty folder (if supported by your Cloudinary plan)
        await cloudinary.api.delete_folder(folderPath);
      } catch (err) {
        console.error("Cloudinary cleanup failed:", err);
      }
    }

    const course = await prisma.course.delete({
      where: { title_instructorId: { instructorId: session.user.id, title } }
    });

    if (!course) return NextResponse.json({ message: "Course Not Found!" }, { status: 400 });

    return NextResponse.json({ message: "Course Deleted Successfully!" }, { status: 200 });
  } catch (error) {
    console.log('Error while deleting course! ', error);
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 });
  }
}

const validatedFormData = (formData) => {
  const title = (formData.get('title')).trim();
  const description = formData.get('description');
  const category = formData.get('category');
  const validityDays = Number(formData.get('validityDays'));
  const isPaid = formData.get('isPaid');
  const status = formData.get('status');
  const thumbnail = formData.get('thumbnail');

  if (isNaN(validityDays) && validityDays < 0) {
    return { valid: false, message: "Validity duration must be a valid number", status: 400 };
  }

  let totalPrice = null, actualPrice = null;
  if (isPaid === "true") {
    totalPrice = Number(formData.get('totalPrice'));
    actualPrice = Number(formData.get('actualPrice'));

    // Check if conversion resulted in valid numbers
    if (isNaN(totalPrice)) {
      return { valid: false, message: "Total Price must be a valid number", status: 400 };
    }

    if (isNaN(actualPrice)) {
      return { valid: false, message: "Actual Price must be a valid number", status: 400 };
    }

    if (totalPrice < 0 || actualPrice < 0) {
      return { valid: false, message: "Prices must be greater than 0", status: 400 };
    }

    if (totalPrice < actualPrice) {
      return { valid: false, message: "Before discount price should be greater than of actual price", status: 400 };
    }
  }

  return { valid: true, title, description, category, validityDays, isPaid, status, thumbnail, totalPrice, actualPrice };
}