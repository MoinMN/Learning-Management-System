"use client";

import { PaginationControls } from "@/components/Course/PaginationControls";
import { PageHeading, SectionHeading } from "@/components/Headers";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FiPlus } from "react-icons/fi";
import { useState } from "react";
import Link from "next/link";

const Chapters = ({ course }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const chaptersPerPage = 5;

  // Get current chapters
  const indexOfLastChapter = currentPage * chaptersPerPage;
  const indexOfFirstChapter = indexOfLastChapter - chaptersPerPage;
  const currentChapters = course?.Chapters?.slice(indexOfFirstChapter, indexOfLastChapter) || [];

  // Calculate total pages
  const totalPages = Math.ceil((course?.Chapters?.length || 0) / chaptersPerPage);

  return (
    <div className="mx-auto px-4 py-8 text-white space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 w-full">
        <div className="flex-1 min-w-0 space-y-2">
          <PageHeading className="truncate">{course?.title}</PageHeading>
          <p className="text-gray-400 text-xs md:text-sm lg:text-base">{course?.description}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`whitespace-nowrap ${(course?.isApproved && course?.status === "PUBLISHED") ? "bg-green-600" : "bg-yellow-600"}`}>
              {course?.status === 'PUBLISHED'
                ? course?.isApproved
                  ? "Published & Approved"
                  : "Waiting for approval"
                : "Unpublished"
              }
            </Badge>
          </div>
        </div>

        <div className="flex-shrink-0">
          {/* price/status content here */}
          {course?.isPaid ? (
            <div className="flex flex-col text-right">
              <div className="text-lg font-semibold">
                ₹{course?.actualPrice}
              </div>
              <div className="text-sm text-gray-400 line-through">
                ₹{course?.totalPrice}
              </div>
              {course?.totalPrice > course?.actualPrice && (
                <div className="text-sm text-green-400 font-semibold">
                  {Math.round(((course?.totalPrice - course?.actualPrice) / course?.totalPrice) * 100)}% off
                </div>
              )}
              <div className="text-xs text-gray-300 mt-1">
                You will get ₹{Math.round(course?.actualPrice * 0.95)}
              </div>
            </div>
          ) : (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
              FREE
            </span>
          )}
        </div>
      </div>

      <Separator className="bg-gray-700" />

      {/* Chapters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeading>Chapters</SectionHeading>
          <Link
            href="chapters/create"
            className="inline-flex items-center gap-2 px-2 md:px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition shadow-md text-base"
          >
            <FiPlus className="text-base" /> Create Chapter
          </Link>
        </div>

        {currentChapters.length > 0 ? (
          <>
            {currentChapters.map((chapter, index) => (
              <Card
                key={chapter?.id}
                className="border border-gray-700 bg-gray-900 text-gray-100 shadow-sm hover:border-gray-500 transition-colors"
              >
                <Link
                  href={`chapters/${chapter?.title.replace(/\s+/g, "+")}`}
                  className="block"
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        Chapter {chapter?.order}: {chapter?.title}
                      </p>
                      <Badge
                        className={
                          chapter?.status === "PUBLISHED"
                            ? "bg-green-600"
                            : "bg-yellow-600"
                        }
                      >
                        {chapter?.status}
                      </Badge>
                    </div>

                    {(chapter?.pdfUrl || chapter?.notes || chapter?.videoUrl) && (
                      <div className="flex flex-wrap gap-2 pt-2 text-xs text-gray-300">
                        {chapter?.videoUrl && (
                          <span className="bg-gray-800 px-2 py-1 rounded-md border border-gray-600">
                            Video Added
                          </span>
                        )}
                        {chapter?.pdfUrl && (
                          <span className="bg-gray-800 px-2 py-1 rounded-md border border-gray-600">
                            PDF Added
                          </span>
                        )}
                        {chapter?.notes && (
                          <span className="bg-gray-800 px-2 py-1 rounded-md border border-gray-600">
                            Notes Added
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Link>
              </Card>
            ))}

            {/* Using the reusable pagination component */}
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <p className="text-gray-400">No chapters added yet.</p>
        )}
      </div>
    </div>
  );
};

export default Chapters;