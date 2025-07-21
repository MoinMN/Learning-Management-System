"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";

export const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}) => {
  const getPageNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const leftBound = Math.max(2, currentPage - 1);
      const rightBound = Math.min(totalPages - 1, currentPage + 1);

      pageNumbers.push(1);

      if (leftBound > 2) pageNumbers.push('...');

      for (let i = leftBound; i <= rightBound; i++) pageNumbers.push(i);

      if (rightBound < totalPages - 1) pageNumbers.push('...');

      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        {/* First Page Button */}
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange(1);
            }}
            className={`bg-gray-800 text-white hover:text-white hover:bg-gray-700 ${currentPage === 1 ? "opacity-50 pointer-events-none cursor-not-allowed" : "cursor-pointer"}`}
          >
            <FiChevronsLeft className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>

        {/* Previous Page Button */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
            className={`bg-gray-800 text-white hover:text-white hover:bg-gray-700 ${currentPage === 1 ? "opacity-50 pointer-events-none cursor-not-allowed" : "cursor-pointer"}`}
          />
        </PaginationItem>

        {/* Page Numbers */}
        {getPageNumbers().map((pageNumber, index) => (
          <PaginationItem key={index}>
            {pageNumber === '...' ? (
              <PaginationEllipsis className="text-white" />
            ) : (
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(pageNumber);
                }}
                isActive={pageNumber === currentPage}
                className={`text-white hover:text-white ${pageNumber === currentPage ? "bg-gray-700 hover:bg-gray-700 cursor-not-allowed" : "bg-gray-800 hover:bg-gray-700"}`}
              >
                {pageNumber}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* Next Page Button */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
            className={`bg-gray-800 text-white hover:text-white hover:bg-gray-700 ${currentPage === totalPages ? "opacity-50 pointer-events-none cursor-not-allowed" : "cursor-pointer"}`}
          />
        </PaginationItem>

        {/* Last Page Button */}
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange(totalPages);
            }}
            className={`bg-gray-800 text-white hover:text-white hover:bg-gray-700 ${currentPage === totalPages
              ? "opacity-50 pointer-events-none cursor-not-allowed"
              : "cursor-pointer"
              }`}
          >
            <FiChevronsRight className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};