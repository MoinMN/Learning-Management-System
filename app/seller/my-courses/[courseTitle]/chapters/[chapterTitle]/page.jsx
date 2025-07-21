"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Loader2, Edit, Trash2, CalendarDays, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import SecureVideoPlayer from "@/components/Course/VideoPlayer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams, useRouter } from "next/navigation";
import LoadingAnimation from "@/components/SubLoader";
import PDFViewer from "@/components/Course/PdfViewer";
import { SectionHeading } from "@/components/Headers";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";


const Chapter = () => {
  const { courseTitle, chapterTitle } = useParams();
  const router = useRouter();

  const [chapter, setChapter] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchPDF = async () => {
    try {
      const response = await fetch(
        `/api/seller/course/chapter/pdf?courseTitle=${encodeURIComponent(courseTitle)}&chapterTitle=${encodeURIComponent(chapterTitle)}`
      );

      if (!response.ok) {
        const result = await response.json();
        toast.error(result?.message || 'Failed to fetch PDF');
      } else {
        // Create blob from response
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob)
        setPdfBlobUrl(blobUrl)
      }
    } catch (error) {
      console.error('PDF fetch error:', error)
      toast.error(error.message || "Failed to load PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVideoUrl = async () => {
    setIsLoading(true);
    try {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
        setVideoUrl(null);
      }

      const response = await fetch(
        `/api/seller/course/chapter/video?courseTitle=${decodeURIComponent(courseTitle)}&chapterTitle=${decodeURIComponent(chapterTitle)}`,
        { credentials: 'include', headers: { 'Accept': 'video/mp4', } }
      );

      if (!response.ok) {
        try {
          const result = await response.json();
          toast.error(result?.message || 'Failed to fetch video');
        } catch (jsonError) {
          toast.error(`HTTP error! status: ${response.status}`);
        }
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChapter = async () => {
    try {
      const response = await fetch(
        `/api/seller/course/chapter?courseTitle=${courseTitle}&chapterTitle=${chapterTitle}`
      );
      const result = await response.json();

      if (response.ok) {
        setChapter(result.chapter);
      } else {
        toast.error(result?.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch chapter.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseTitle && chapterTitle) fetchChapter();
  }, [courseTitle, chapterTitle]);

  useEffect(() => {
    if (!chapter) return;

    if (chapter?.pdfUrl) fetchPDF();
    if (chapter?.videoUrl) fetchVideoUrl();

    // Clean up blob URL when component unmounts
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    }
  }, [chapter]);

  const handleDelete = async (e) => {
    e.preventDefault();

    if (!chapter) return toast.error("Wait till data load!");
    setDeleting(true);

    try {
      const response = await fetch(
        `/api/seller/course/chapter?chapterId=${chapter?.id}`, { method: "DELETE" }
      );
      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      toast.success("Chapter deleted successfully.");
      router.push(`/seller/my-courses/${courseTitle}/chapters`);
    } catch (err) {
      toast.error(err.message || "Failed to delete chapter.");
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) return <LoadingAnimation />;

  if (!chapter) return <p className="text-center text-gray-400 py-8">Chapter not found.</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <div className="flex items-center justify-between">
        {/* Back Button */}
        <BackButton handleOnClick={() => router.back()} />

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            onClick={() => router.push(`./${decodeURIComponent(chapterTitle)}/edit`)}
            variant="secondary"
            className="gap-1 md:gap-2 cursor-pointer px-2 md:px-4"
          >
            <Edit className="h-4 w-4" /> Edit
          </Button>

          {/* Delete Button with AlertDialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" className="hover:bg-red-700 cursor-pointer">
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gray-900 border-gray-700 text-gray-200">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Chapter?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this chapter? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer text-black">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleting}
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 cursor-pointer"
                >
                  {deleting
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</>
                    : "Confirm Delete"
                  }
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Title Card */}
      <Card className="border-gray-700 bg-gray-900 relative">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <SectionHeading>
                Chapter {chapter?.order}: {chapter?.title || "Chapter Title"}
              </SectionHeading>
            </div>
            <div className="flex flex-col items-end space-y-1 text-xs text-gray-400">
              {chapter?.createdAt && (
                <div className="flex items-center">
                  <CalendarDays className="h-3 w-3 mr-1" />
                  <span>Created: {new Date(chapter.createdAt).toLocaleDateString()}</span>
                </div>
              )}
              {chapter?.updatedAt && (
                <div className="flex items-center">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  <span>Updated: {new Date(chapter.updatedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Video Player Card */}
      {chapter?.videoUrl && (
        <Card className="border-gray-700 bg-gray-900">
          <CardHeader className="pb-2">
            <SectionHeading>Chapter Video</SectionHeading>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="aspect-video w-full">
              <SecureVideoPlayer videoUrl={videoUrl} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDF Viewer Card */}
      {pdfBlobUrl && (
        <Card className="border-gray-700 bg-gray-900 overflow-hidden">
          <CardHeader className="pb-2">
            <SectionHeading>Chapter PDF</SectionHeading>
          </CardHeader>
          <CardContent className="pt-0 px-2 md:px-4">
            <div className="h-[70vh] min-h-[650px] w-full">
              <PDFViewer
                pdfUrl={pdfBlobUrl}
                onLoad={() => { }}
                onError={(err) => console.log('PDF error: ', err)}
                className="h-full w-full"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes Card */}
      <Card className="border-gray-700 bg-gray-900">
        <CardHeader className="pb-2">
          <h2 className="text-lg font-semibold text-gray-200">Chapter Notes</h2>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="max-h-[400px] rounded-lg border border-gray-700">
            <div className="prose prose-invert max-w-none p-4 text-sm text-gray-300">
              {chapter?.notes ? (
                <div dangerouslySetInnerHTML={{ __html: chapter.notes }} />
              ) : (
                <p className="text-gray-400">No notes provided for this chapter.</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chapter;