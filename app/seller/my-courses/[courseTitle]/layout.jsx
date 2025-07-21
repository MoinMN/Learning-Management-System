"use client";

import { FiBookOpen, FiDollarSign, FiSettings, FiStar, FiUsers } from "react-icons/fi";
import { Badge, IndianRupee, Users, Wallet } from "lucide-react";
import { notFound, useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeading } from "@/components/Headers";
import { useEffect, useState } from "react";
import Nav from "../_components/Nav";
import { toast } from "sonner";

const navItems = [
  { name: "Chapters", icon: <FiBookOpen />, link: "/chapters" },
  { name: "Enrollments", icon: <FiUsers />, link: "/enrollments" },
  { name: "Reviews", icon: <FiStar />, link: "/reviews" },
  { name: "Sales", icon: <FiDollarSign />, link: "/sales" },
  { name: "Settings", icon: <FiSettings />, link: "/settings" },
];

const CourseLayout = ({ children }) => {
  const searchParams = useParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);

  const fetchCourse = async () => {
    if (!searchParams?.courseTitle) {
      return router.push('/seller/course/not-found');
    }

    try {
      const response = await fetch(`/api/seller/course?title=${searchParams?.courseTitle}`, { method: "GET" });
      const result = await response.json();

      if (response.ok) {
        setCourseData(result?.course);
      } else {
        return router.push('/seller/course/not-found');
      }
    } catch (error) {
      console.log('Error while fetching course data ', error);
      toast.error("Internal Server Error, Try Again Later!");
      return router.push('/seller/course/not-found');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Enhanced Sticky Header */}
      <div className="sticky top-0 z-50 border-b border-gray-700 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          {isLoading
            ? <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              {/* Course Title Skeleton */}
              <Skeleton className="h-8 w-3/4 rounded-md max-w-[50vw] bg-zinc-800" />
              {/* Course Metrics Skeleton */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Enrollment Count Skeleton */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full bg-zinc-800" />
                  <Skeleton className="h-4 w-20 rounded-md bg-zinc-800" />
                </div>
                {/* Pricing Information Skeleton */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full bg-zinc-800" />
                  <Skeleton className="h-4 w-16 rounded-md bg-zinc-800" />
                </div>
              </div>
            </div>
            : <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              {/* Course Title */}
              < PageHeading className="truncate max-w-[50vw]">{courseData?.title}</PageHeading>

              {/* Course Metrics */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {/* Enrollment Count */}
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{courseData?.Enrollments?.length || 0} students</span>
                </div>

                {/* Pricing Information */}
                {courseData?.isPaid
                  ? <div className="flex items-center gap-1">
                    <IndianRupee className="h-4 w-4 text-gray-400" />
                    <span>{courseData?.actualPrice}</span>
                    <span className="text-gray-400 line-through ml-1">{courseData?.totalPrice}</span>
                  </div>
                  : <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    FREE
                  </span>
                }
              </div>
            </div>
          }
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row">
        <Nav navItems={navItems} />
        <div className="px-2 md:px-4 w-full">{children}</div>
      </div>
    </div >
  )
}

export default CourseLayout
