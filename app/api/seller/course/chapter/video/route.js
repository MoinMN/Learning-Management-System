import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/config/supabase";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const courseTitle = url.searchParams.get("courseTitle");
    const chapterTitle = url.searchParams.get("chapterTitle");

    const decodedCourseTitle = decodeURIComponent(courseTitle.replace(/\+/g, " "));
    const decodedChapterTitle = decodeURIComponent(chapterTitle.replace(/\+/g, " "));

    const course = await prisma.course.findUnique({
      where: { title_instructorId: { title: decodedCourseTitle, instructorId: session.user.id } }
    });

    const chapter = await prisma.chapter.findUnique({
      where: { title_courseId: { title: decodedChapterTitle, courseId: course.id } },
      include: { course: true }
    });

    if (!chapter || chapter.course.instructorId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Check if video exists
    if (!chapter.videoUrl) {
      return NextResponse.json({ message: 'Video not found' }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin.storage
      .from('courses')
      .download(chapter.videoUrl);

    if (error || !data) {
      return NextResponse.json({ message: 'Video unavailable' }, { status: 500 });
    }

    // Get the complete file first
    const videoBuffer = await data.arrayBuffer();
    const videoSize = videoBuffer.byteLength;

    const range = req.headers.get('range');
    if (!range) {
      // Return full video if no range header
      return new NextResponse(videoBuffer, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': videoSize.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-store'
        }
      });
    }

    // Handle range requests
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/bytes=/, '').split('-')[0]);
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;

    const chunk = videoBuffer.slice(start, end + 1);

    return new NextResponse(chunk, {
      status: 206,
      headers: new Headers({
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength.toString(),
        'Content-Type': 'video/mp4',
        'Cache-Control': 'no-store'
      }),
    });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error!' }, { status: 500 });
  }
}