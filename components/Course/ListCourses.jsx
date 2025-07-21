import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeading } from "../Headers";
import { FiPlus } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";

const ListCourses = ({ courses, userRole, pageTitle }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white space-y-6">

      <div className="flex justify-between">
        <PageHeading>{pageTitle}</PageHeading>
        {userRole === "SELLER" && (
          <Link
            href="/seller/my-courses/create"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition duration-200"
          >
            <FiPlus className="text-lg" />
            <span className="text-sm">Create</span>
          </Link>
        )
        }
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.length > 0 ? (
          courses?.map((course) => (
            <Link
              key={course.id}
              href={`/${userRole === "ADMIN" ? "admin" : userRole === "SELLER" ? "seller" : userRole === "VIEWER" ? "viewer" : ""}/my-courses/${encodeURIComponent(course.title).replace(/%20/g, "+")}/chapters`}
              className="hover:scale-[1.02] sm:hover:scale-[1.03] transition-transform duration-300"
            >
              <Card className="border border-gray-700 bg-gray-900 text-gray-100 shadow-lg h-full flex flex-col rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Image */}
                <div className="relative w-full h-48 sm:h-56">
                  <Image
                    src={course.thumbnail || "/assets/default_thumbnail.png"}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <CardContent className="p-4 flex flex-col gap-3 grow">
                  {/* Title */}
                  <h2 className="font-semibold text-lg sm:text-xl leading-tight line-clamp-2">
                    {course.title}
                  </h2>

                  {/* Category + Paid */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-block text-xs px-3 py-1 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition">
                      {course.category}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold shadow ${course.isPaid ? "bg-green-600 text-white hover:bg-green-700" : "bg-yellow-600 text-black hover:bg-yellow-700"} transition`}>
                      {course.isPaid ? "Paid" : "Free"}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Price + Status */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-auto pt-2 gap-2 sm:gap-0">
                    <div className="flex flex-col text-green-400 text-sm">
                      {course.isPaid &&
                        <>
                          <span className="font-bold text-lg">₹{course.actualPrice}</span>
                          <span className="line-through text-gray-400 text-xs">₹{course.totalPrice}</span>
                          {course.totalPrice > course.actualPrice && (
                            <span className="text-green-500 font-semibold">
                              {Math.round(((course.totalPrice - course.actualPrice) / course.totalPrice) * 100)}% off
                            </span>
                          )}
                        </>
                      }
                    </div>
                    <Badge className={(course.isApproved && course.status === "PUBLISHED") ? "bg-green-600" : "bg-yellow-600"}>
                      {course.status === 'PUBLISHED'
                        ? course.isApproved
                          ? "Published & Approved"
                          : "Waiting for approval"
                        : "Unpublished"
                      }
                    </Badge>
                  </div>

                  {/* CreatedAt Date */}
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-700 mt-2">
                    Created on: {new Date(course.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <p className="text-gray-400 col-span-full">
            No course found!
          </p>
        )}
      </div>
    </div>
  );
};

export default ListCourses;
