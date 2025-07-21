"use client";

import LoadingAnimation from "@/components/SubLoader";
import { notFound, useParams } from "next/navigation";
import CoursePage from "../../_components/Chapters";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Course = () => {
  const searchParams = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [courseData, setCourseData] = useState({});

  const fetchCourse = async () => {
    if (!searchParams?.courseTitle) {
      return notFound();
    }

    try {
      const response = await fetch(`/api/seller/course?title=${searchParams?.courseTitle}`, { method: "GET" });
      const result = await response.json();

      if (response.ok) {
        setCourseData(result?.course);
      } else {
        return notFound();
      }
    } catch (error) {
      console.log('Error while fetching course data ', error);
      toast.error("Internal Server Error, Try Again Later!");
      return notFound();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  if (isLoading) return <LoadingAnimation />;

  if (!courseData) return notFound();

  return <CoursePage course={courseData} />;
}

export default Course
