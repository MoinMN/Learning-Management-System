"use client";

import ChapterForm from "@/components/Course/ChapterForm";
import { useParams, useRouter } from "next/navigation";
import LoadingAnimation from "@/components/SubLoader";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const EditChapter = () => {
  const { courseTitle, chapterTitle } = useParams();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(true);
  const [chapterData, setChapterData] = useState(null);

  const fetchChapter = async () => {
    try {
      const response = await fetch(
        `/api/seller/course/chapter?courseTitle=${courseTitle}&chapterTitle=${chapterTitle}`
      );
      const result = await response.json();

      if (response.ok) {
        setChapterData(result.chapter);
      } else {
        toast.error(result?.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch chapter.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courseTitle && !chapterTitle) {
      return toast.error("Course & chapter title is required!");
    }

    if (!chapterData) {
      return toast.error("Wait Till Data Loaded!");
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("courseRawTitle", courseTitle);
    formData.append("chapterRawTitle", chapterTitle);
    formData.append("id", chapterData.id);
    formData.append("title", chapterData.title);
    formData.append("status", chapterData.status);

    if (chapterData.videoUrl) formData.append("videoUrl", chapterData.videoUrl);
    if (chapterData.notes) formData.append("notes", chapterData.notes);
    if (chapterData.pdfUrl) formData.append("pdfUrl", chapterData.pdfUrl);

    try {
      const response = await fetch('/api/seller/course/chapter', { method: "PUT", body: formData });
      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        router.push('../');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.log('Error while creating chapter', error);
      toast.error("Internal Server Error, Try again later!");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchChapter();
  }, []);

  if (!chapterData) return <LoadingAnimation />;

  return (
    <ChapterForm
      title={`Edit Chapter ${chapterData?.order}: ${chapterData?.title}`}
      chapterData={chapterData}
      setChapterData={setChapterData}
      submitting={submitting}
      handleSubmit={handleSubmit}
      handleCancelDialogAction={() => router.back()}
    />
  )
}

export default EditChapter
