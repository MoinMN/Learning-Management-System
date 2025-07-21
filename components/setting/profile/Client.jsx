"use client";

import { useSearchParams } from "next/navigation";
import ProfileData from "./Form";
import ProfileInfo from "./Data";

const ProfileClient = () => {
  const searchParams = useSearchParams();
  const isEditing = searchParams.get("editing") === "true";

  return isEditing ? <ProfileData /> : <ProfileInfo />;
}

export default ProfileClient
