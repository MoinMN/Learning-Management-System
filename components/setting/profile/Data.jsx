"use client";

import { FaPhone, FaEnvelope, FaEdit, FaCheck } from "react-icons/fa";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { HiOutlineUserCircle } from "react-icons/hi";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { Card, CardContent } from "@/components/ui/card";
import LoadingAnimation from "@/components/SubLoader";
import Heading from "../Heading";

const ProfileData = () => {
  const router = useRouter();
  const pathname = usePathname();

  const { user, loading } = useUser();

  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditActive, setIsEditActive] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (isEditActive) params.set('editing', 'true');
    else params.delete('editing');

    router.replace(`${pathname}?${params.toString()}`);
  }, [isEditActive]);

  useEffect(() => {
    if (user) {
      setUserInfo(user);
      setIsLoading(false);
    }
  }, [loading]);

  if (isLoading) return <LoadingAnimation />;

  return (
    <div className="w-full space-y-8">
      {/* Profile Header */}
      <Heading title="My Profile" />

      {/* Profile Content */}
      <Card className="bg-transparent border border-gray-700 text-gray-100 w-full max-w-2xl mx-auto rounded-2xl shadow-xl">
        <CardContent className="flex flex-col items-center space-y-6">
          {/* Profile Image */}
          <div className="relative group">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-lg group-hover:border-white/50 transition-all duration-300">
              {userInfo?.avatar ? (
                <Image
                  src={userInfo.avatar}
                  alt={`${userInfo?.name || "User"}'s profile picture`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 128px"
                />
              ) : (
                <HiOutlineUserCircle className="w-full h-full text-gray-400" />
              )}
            </div>
            <div className="absolute -bottom-2 right-2 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full shadow-md">
              <FaCheck size={12} />
            </div>
          </div>

          {/* User Info */}
          <div className="flex flex-col items-center space-y-4 text-center w-full">
            {/* Name and Verified Badge */}
            <div className="flex items-center space-x-2">
              <h2 className="text-xl md:text-2xl font-bold text-white">{userInfo?.name || "Unknown User"}</h2>
              {userInfo?.isVerified && (
                <span className="text-blue-400" title="Verified">
                  <RiVerifiedBadgeFill size={20} />
                </span>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center justify-center space-x-2 w-full max-w-md">
              <FaEnvelope className="text-gray-400" size={14} />
              <span className="text-xs md:text-sm text-gray-300 truncate">{userInfo?.email || "No Email Provided"}</span>
            </div>

            {/* Phone */}
            <div className={`flex items-center justify-center space-x-2 w-full max-w-md text-xs md:text-sm ${userInfo?.number ? "text-gray-300" : "text-red-400"}`}>
              <FaPhone className="rotate-90" size={14} />
              {userInfo?.number
                ? <span className="hover:text-white truncate">{userInfo.number}</span>
                : <span>Phone Number Not Provided!</span>}
            </div>

            {/* Bio */}
            <div className="w-full max-w-md mt-2">
              <p className={`text-xs md:text-sm text-gray-400 ${userInfo?.bio?.length > 100 ? "line-clamp-3 hover:line-clamp-none transition-all cursor-pointer" : ""}`}>
                {userInfo?.bio || "No bio available."}
              </p>
              {userInfo?.bio?.length > 100 && (
                <span className="text-xs text-blue-400 mt-1 inline-block">Click to expand</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Button */}
      <Button
        variant="secondary"
        className="px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm md:text-base rounded-lg font-medium flex items-center gap-2 cursor-pointer mx-auto"
        onClick={() => setIsEditActive(true)}
      >
        <FaEdit className="text-sm sm:text-base" size={16} />
        <span>Edit Profile</span>
      </Button>
    </div>
  )
}

export default ProfileData
