"use client";

import ListCourses from "@/components/Course/ListCourses";
import LoadingAnimation from "@/components/SubLoader";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const MyCourses = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  const fetchMyCourses = async () => {
    try {
      const response = await fetch('/api/seller/course/user', { method: "GET" });
      const result = await response.json();

      if (response.ok) {
        setCourses(result?.courses);
      }
    } catch (error) {
      console.log('Error while fetching my courses ', error);
      toast.error("Internal Server Error, Try Again Later!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  if (isLoading) return <LoadingAnimation />;

  return (
    <ListCourses
      courses={courses}
      userRole="SELLER"
      pageTitle={courses?.length > 1 ? "My Courses" : "My Course"}
    />
  );
}

export default MyCourses
