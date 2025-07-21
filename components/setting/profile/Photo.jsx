"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import { toast } from "sonner";

const ProfilePhoto = ({ userInfo, setFile, setIsAvatarChange }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setIsAvatarChange(true);

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(selectedFile.type)) {
      return toast.error('Please upload a JPG, JPEG, or PNG file');
    }

    // Validate file size (max 2MB)
    if (selectedFile.size > 2 * 1024 * 1024) {
      return toast.error('File size must be less than 2MB');
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(selectedFile);

    setFile(selectedFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative group">
        <Avatar className="h-16 w-16 cursor-pointer" onClick={triggerFileInput}>
          <AvatarImage src={previewUrl || userInfo.avatar} />
          <AvatarFallback>
            {userInfo.name?.charAt(0)?.toUpperCase() || "M"}
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-opacity cursor-pointer">
          <span className="text-white text-xs font-medium">Change</span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Profile Photo</p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="cursor-pointer"
            onClick={triggerFileInput}
          >
            Upload
          </Button>
          <p className="text-xs text-muted-foreground">
            JPG, JPEG, PNG (Max 2MB)
          </p>
        </div>

        {/* Hidden file input */}
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png"
          className="hidden"
        />
      </div>
    </div>
  )
}

export default ProfilePhoto
