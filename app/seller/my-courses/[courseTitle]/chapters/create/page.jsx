"use client";

import ChapterForm from "@/components/Course/ChapterForm";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const CreateChapter = () => {
  const { courseTitle } = useParams();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [chapterData, setChapterData] = useState({
    title: "",
    videoUrl: "",
    notes: "",
    pdfUrl: "",
    status: "UNPUBLISHED"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!chapterData.title) {
      return toast.error("Chapter title is required!");
    }

    // At least one material must be present
    if (!chapterData.videoUrl && !chapterData.notes && !chapterData.pdfUrl && !chapterData.imageUrl) {
      return toast.error("Please provide at least one material: video, notes, pdf, or image.");
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("courseRawTitle", courseTitle);
    formData.append("title", chapterData.title);
    formData.append("status", chapterData.status);

    if (chapterData.videoUrl) formData.append("videoUrl", chapterData.videoUrl);
    if (chapterData.notes) formData.append("notes", chapterData.notes);
    if (chapterData.pdfUrl) formData.append("pdfUrl", chapterData.pdfUrl);

    try {
      const response = await fetch('/api/seller/course/chapter', {
        method: "POST",
        body: formData
      });
      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        setChapterData(null);
        router.push('./');
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

  return (
    <ChapterForm
      title="Create New Chapter"
      chapterData={chapterData}
      setChapterData={setChapterData}
      submitting={submitting}
      handleSubmit={handleSubmit}
      handleCancelDialogAction={() => router.back()}
    />
  );
};

export default CreateChapter;