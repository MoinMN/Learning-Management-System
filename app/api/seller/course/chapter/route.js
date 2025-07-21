import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { supabaseAdmin } from "@/config/supabase";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) return NextResponse.json({ message: "Authentication Required!" }, { status: 401 });

    const url = new URL(req.url);
    const courseTitle = url.searchParams.get("courseTitle");
    const chapterTitle = url.searchParams.get("chapterTitle");

    const decodedCourseTitle = decodeURIComponent(courseTitle.replace(/\+/g, " "));
    const decodedChapterTitle = decodeURIComponent(chapterTitle.replace(/\+/g, " "));

    if (!decodedCourseTitle || !decodedChapterTitle) return NextResponse.json({ message: "Title Required!" }, { status: 400 });

    const course = await prisma.course.findUnique({
      where: { title_instructorId: { title: decodedCourseTitle, instructorId: session.user.id } }
    });

    if (!course) return NextResponse.json({ message: "Course Not Found!" }, { status: 400 });

    const chapter = await prisma.chapter.findUnique({
      where: { title_courseId: { title: decodedChapterTitle, courseId: course.id } }
    });

    if (!chapter) return NextResponse.json({ message: "Chapter Not Found!" }, { status: 400 });

    return NextResponse.json({ message: "Success!", chapter }, { status: 200 });
  } catch (error) {
    console.log('Error while fetching chapter data! ', error);
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

    const courseRawTitle = formData.get("courseRawTitle");
    const title = (formData.get("title")).trim();
    const status = formData.get("status");
    const notes = formData.get("notes");
    const videoUrl = formData.get("videoUrl");
    const pdfUrl = formData.get("pdfUrl");

    const courseTitle = decodeURIComponent(courseRawTitle).replace(/\+/g, " ");

    if (!courseTitle || !title || (status === "UNPUBLISHED" && status === "PUBLISHED")) {
      return NextResponse.json({ message: "Mandatory fields are missing!" }, { status: 400 });
    }

    if (!notes && !videoUrl && !pdfUrl) {
      return NextResponse.json(
        { message: "At least one material is required (Notes, Video, or PDF)." },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { title_instructorId: { title: courseTitle, instructorId: session.user.id } },
      include: { Chapters: true }
    });

    if (!course) return NextResponse.json({ message: "Course Not Found!" }, { status: 404 });

    const isTitleExist = await prisma.chapter.findUnique({
      where: { title_courseId: { title, courseId: course.id } }
    });

    if (isTitleExist) return NextResponse.json({ message: "Title already used for this course!" }, { status: 400 });

    const uploads = {};

    // VIDEO UPLOAD TO SUPABASE (Service Role Version)
    if (videoUrl && typeof videoUrl.arrayBuffer === "function") {
      try {
        // Generate secure filename and path
        const fileExtension = videoUrl.name.split('.').pop() || 'mp4';
        const fileName = `${title.replace(/\s+/g, "-")}-${crypto.randomUUID()}.${fileExtension}`;
        const filePath = `${session.user.username}/${course.title.replace(/\s+/g, "-")}/${title.replace(/\s+/g, "-")}/${fileName}`;

        // Convert to Blob with proper type
        const videoBlob = new Blob([await videoUrl.arrayBuffer()], { type: videoUrl.type });

        // Validate file size 1GB
        if (videoBlob.size > 1000 * 1024 * 1024) {
          return NextResponse.json(
            { message: "Video file exceeds 1GB limit" },
            { status: 413 }
          );
        }

        // Upload with service role client
        const { error: uploadError } = await supabaseAdmin.storage
          .from('courses')
          .upload(filePath, videoBlob, {
            cacheControl: 'private, max-age=3600',
            contentType: videoUrl.type,
            upsert: false
          });

        if (uploadError) {
          console.error('Supabase upload error:', uploadError);
          return NextResponse.json({ message: `Video Upload Error as ${uploadError.message}` }, { status: 500 });
        }

        uploads.videoUrl = filePath;
      } catch (error) {
        console.error('Video upload error:', error);
        return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
      }
    }

    // PDF UPLOAD TO SUPABASE
    if (pdfUrl && typeof pdfUrl.arrayBuffer === "function") {
      try {
        // Generate secure filename and path
        const fileExtension = pdfUrl.name.split('.').pop() || 'pdf';
        const fileName = `${title.replace(/\s+/g, "-")}-${crypto.randomUUID()}.${fileExtension}`;
        const filePath = `${session.user.username}/${course.title.replace(/\s+/g, "-")}/${title.replace(/\s+/g, "-")}/${fileName}`;

        // Convert to Blob
        const pdfBlob = new Blob([await pdfUrl.arrayBuffer()], { type: pdfUrl.type || 'application/pdf' });

        // Upload to different bucket (or same bucket with different folder)
        const { error: uploadError } = await supabaseAdmin.storage
          .from('courses')
          .upload(filePath, pdfBlob, {
            cacheControl: 'private, max-age=3600',
            contentType: 'application/pdf',
            upsert: false
          });

        if (uploadError) {
          console.error('PDF upload error:', uploadError);
          return NextResponse.json({ message: `PDF Upload Error as ${uploadError.message}` }, { status: 500 });
        }

        // Store path only
        uploads.pdfUrl = filePath;
      } catch (error) {
        console.error('PDF upload error:', error);
        return NextResponse.json(
          { message: "An unexpected error occurred" },
          { status: 500 }
        );
      }
    }

    await prisma.chapter.create({
      data: {
        courseId: course.id,
        title, notes,
        status: course.status === "UNPUBLISHED" ? "UNPUBLISHED" : status,
        order: course.Chapters.length + 1,
        videoUrl: uploads.videoUrl || null,
        pdfUrl: uploads.pdfUrl || null,
      }
    });

    return NextResponse.json(
      { message: `Chapter Successfully Created!${course.status === "UNPUBLISHED" ? " Chapter will be unpublished as course is unpublished" : ""}` },
      { status: 201 }
    );
  } catch (error) {
    console.error("Chapter creating error: ", error);
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Authentication required!" }, { status: 401 });
    }

    const formData = await req.formData();

    const courseRawTitle = formData.get("courseRawTitle");
    const chapterRawTitle = formData.get("chapterRawTitle");
    const id = formData.get("id");
    const title = (formData.get("title")).trim();
    const status = formData.get("status");
    const notes = formData.get("notes");
    const videoUrl = formData.get("videoUrl");
    const pdfUrl = formData.get("pdfUrl");

    const courseTitle = decodeURIComponent(courseRawTitle).replace(/\+/g, " ");
    const chapterTitle = decodeURIComponent(chapterRawTitle).replace(/\+/g, " ");

    if (!courseTitle || !chapterTitle || !title || !status) {
      return NextResponse.json({ message: "Mandatory fields are missing!" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { title_instructorId: { title: courseTitle, instructorId: session.user.id } },
      include: { Chapters: true }
    });

    if (!course) return NextResponse.json({ message: "Course Not Found!" }, { status: 404 });

    const isTitleExist = await prisma.chapter.findUnique({
      where: { title_courseId: { title, courseId: course.id }, NOT: { id } }
    });

    if (isTitleExist) return NextResponse.json({ message: "Title already used for this course!" }, { status: 400 });

    const existingChapter = await prisma.chapter.findUnique({ where: { id } });

    const uploads = {};

    // VIDEO UPLOAD TO SUPABASE
    if (videoUrl && typeof videoUrl.arrayBuffer === "function") {
      try {
        // 1. First delete existing video if it exists
        if (existingChapter?.videoUrl) {
          const { error: deleteError } = await supabaseAdmin.storage
            .from('courses')
            .remove([existingChapter.videoUrl]);

          if (deleteError && deleteError.message !== 'Object not found') {
            console.error('Supabase delete error:', deleteError);
            return NextResponse.json(
              { message: `Failed to delete old video: ${deleteError.message}` },
              { status: 500 }
            );
          }
        }

        // 2. Generate secure filename and path for new upload
        const fileExtension = videoUrl.name.split('.').pop() || 'mp4';
        const fileName = `${title.replace(/\s+/g, "-")}-${crypto.randomUUID()}.${fileExtension}`;
        const filePath = `${session.user.username}/${course.title.replace(/\s+/g, "-")}/${title.replace(/\s+/g, "-")}/${fileName}`;

        // 3. Convert to Blob with proper type
        const videoBlob = new Blob([await videoUrl.arrayBuffer()], { type: videoUrl.type });

        // 4. Validate file size 1GB
        if (videoBlob.size > 1000 * 1024 * 1024) {
          return NextResponse.json({ message: "Video file exceeds 1GB limit" }, { status: 413 });
        }

        // 5. Upload new video
        const { error: uploadError } = await supabaseAdmin.storage
          .from('courses')
          .upload(filePath, videoBlob, {
            cacheControl: 'private, max-age=3600',
            contentType: videoUrl.type,
            upsert: false
          });

        if (uploadError) {
          console.error('Supabase upload error:', uploadError);
          return NextResponse.json({ message: `Video Upload Error: ${uploadError.message}` }, { status: 500 });
        }

        uploads.videoUrl = filePath;
      } catch (error) {
        console.error('Video upload error:', error);
        return NextResponse.json(
          { message: "An unexpected error occurred during video upload" },
          { status: 500 }
        );
      }
    }

    // PDF UPLOAD TO SUPABASE
    if (pdfUrl && typeof pdfUrl.arrayBuffer === "function") {
      try {
        // 1. First delete existing PDF if it exists
        if (existingChapter?.pdfUrl) {
          const { error: deleteError } = await supabaseAdmin.storage
            .from('courses')
            .remove([existingChapter.pdfUrl]);

          if (deleteError && deleteError.message !== 'Object not found') {
            console.error('PDF delete error:', deleteError);
            return NextResponse.json({ message: `Failed to delete old PDF: ${deleteError.message}` }, { status: 500 });
          }
        }

        // 2. Generate secure filename and path for new upload
        const fileExtension = pdfUrl.name.split('.').pop() || 'pdf';
        const fileName = `${title.replace(/\s+/g, "-")}-${crypto.randomUUID()}.${fileExtension}`;
        const filePath = `${session.user.username}/${course.title.replace(/\s+/g, "-")}/${title.replace(/\s+/g, "-")}/${fileName}`;

        // 3. Convert to Blob
        const pdfBlob = new Blob([await pdfUrl.arrayBuffer()], { type: pdfUrl.type || 'application/pdf' });

        // 4. Upload new PDF
        const { error: uploadError } = await supabaseAdmin.storage
          .from('courses')
          .upload(filePath, pdfBlob, {
            cacheControl: 'private, max-age=3600',
            contentType: 'application/pdf',
            upsert: false
          });

        if (uploadError) {
          console.error('PDF upload error:', uploadError);
          return NextResponse.json({ message: `PDF Upload Error: ${uploadError.message}` }, { status: 500 });
        }

        uploads.pdfUrl = filePath;
      } catch (error) {
        console.error('PDF upload error:', error);
        return NextResponse.json(
          { message: "An unexpected error occurred during PDF upload" },
          { status: 500 }
        );
      }
    }

    await prisma.chapter.update({
      where: { id },
      data: {
        courseId: course.id,
        title, notes,
        status: course.status === "UNPUBLISHED" ? "UNPUBLISHED" : status,
        videoUrl: uploads?.videoUrl !== undefined ? uploads.videoUrl : undefined,
        pdfUrl: uploads?.pdfUrl !== undefined ? uploads.pdfUrl : undefined,
      }
    });

    return NextResponse.json(
      { message: `Chapter Successfully Updated!${course.status === "UNPUBLISHED" ? " Chapter will be unpublished as course is unpublished" : ""}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Chapter updating error: ", error);
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
    const chapterId = url.searchParams.get("chapterId");

    if (!chapterId) return NextResponse.json({ message: "Chapter Not received!" }, { status: 404 });

    const existingChapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { id: true, order: true, courseId: true, videoUrl: true, pdfUrl: true }
    });

    if (!existingChapter) {
      return NextResponse.json({ message: "Chapter not found!" }, { status: 404 });
    }

    // Delete files from Supabase if they exist
    const filesToDelete = [];
    if (existingChapter.videoUrl) filesToDelete.push(existingChapter.videoUrl);
    if (existingChapter.pdfUrl) filesToDelete.push(existingChapter.pdfUrl);

    if (filesToDelete.length > 0) {
      const { error: deleteError } = await supabaseAdmin.storage
        .from('courses')
        .remove(filesToDelete);

      if (deleteError) {
        console.error('Supabase delete error:', deleteError);
        // Continue with deletion even if file deletion fails
      }
    }

    // Delete the chapter record
    await prisma.chapter.delete({ where: { id: chapterId } });

    // Update orders of the remaining chapters
    await prisma.chapter.updateMany({
      where: { courseId: existingChapter.courseId, order: { gt: existingChapter.order } },
      data: { order: { decrement: 1 } }
    });

    return NextResponse.json({ message: "Chapter Deleted Successfully!" }, { status: 200 });
  } catch (error) {
    console.log('Error while deleting chapter! ', error);
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 });
  }
}