import Link from "next/link";
import Image from "next/image";

const NotFound = () => {
  return (
    <div className="flex flex-col justify-center px-4 text-center space-y-3 mx-auto">
      <div className="w-60 h-72 sm:w-72 sm:h-96 mx-auto relative">
        <Image
          src="/assets/not_found.png"
          alt="Course Not Found"
          fill
          className="object-contain rounded-xl"
        />
      </div>

      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 drop-shadow-lg">
        Course Not Found
      </h2>

      <p className="text-gray-400 max-w-sm mx-auto text-sm md:text-base">
        Sorry, the course you are looking for does not exist or may have been removed.
        Please check the URL or explore other courses.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 pt-4 md:pt-6">
        <Link
          href="/seller/dashboard"
          className="px-6 py-3 rounded-lg text-white bg-red-600 hover:bg-red-700 transition shadow-md text-sm md:text-base"
        >
          Return Home
        </Link>
        <Link
          href="/seller/my-courses"
          className="px-6 py-3 rounded-lg border border-gray-600 hover:bg-gray-600/40 transition shadow-md text-sm md:text-base"
        >
          My Courses
        </Link>
      </div>
    </div>
  );
};

export default NotFound;