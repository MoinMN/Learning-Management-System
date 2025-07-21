import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/config/supabase";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const courseTitle = url.searchParams.get("courseTitle");
    const chapterTitle = url.searchParams.get("chapterTitle");

    // Decode URL parameters
    const decodedCourseTitle = decodeURIComponent(courseTitle).replace(/\+/g, " ");
    const decodedChapterTitle = decodeURIComponent(chapterTitle).replace(/\+/g, " ");

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { title_instructorId: { title: decodedCourseTitle, instructorId: session.user.id } },
      select: { id: true }
    });

    if (!course) return NextResponse.json({ message: 'Course not found' }, { status: 404 });

    // Get chapter with PDF path
    const chapter = await prisma.chapter.findUnique({
      where: { title_courseId: { title: decodedChapterTitle, courseId: course.id } },
      include: { course: { select: { instructorId: true } } }
    });

    // Verify access
    if (!chapter || chapter.course.instructorId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (!chapter.pdfUrl) {
      return NextResponse.json({ message: 'PDF not found' }, { status: 404 });
    }

    // Proxy the PDF through your server (more secure)
    const { data: pdfData, error: downloadError } = await supabaseAdmin.storage
      .from('courses')
      .download(chapter.pdfUrl);

    if (downloadError || !pdfData) {
      return NextResponse.json(
        { message: 'PDF unavailable' },
        { status: 500 }
      );
    }

    return new NextResponse(pdfData.stream(), {
      headers: new Headers({
        'Content-Type': 'application/pdf',
        'Cache-Control': 'no-store, max-age=0',
        'Content-Disposition': `inline; filename="${encodeURIComponent(decodedChapterTitle)}.pdf"`,
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; frame-src 'self'",
        'X-Frame-Options': 'SAMEORIGIN'
      })
    });
  } catch (error) {
    console.error('PDF access error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}