"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from "@/components/ui/input-otp";
import { usePathname, useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ProfilePhoto from "./Photo";
import { toast } from "sonner";
import LoadingAnimation from "@/components/SubLoader";
import Heading from "../Heading";

const ProfileForm = () => {
  const pathname = usePathname();
  const router = useRouter();

  // update session when data updated
  const { user, updateUser, loading } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);

  // if changed the sent update avatar request
  const [isAvatarChange, setIsAvatarChange] = useState(false);
  // avatar file store here
  const [file, setFile] = useState(null);
  const [otp, setOtp] = useState(null);
  // detect if OTP sent
  const [isOtpSent, setIsOtpSent] = useState(false);
  // is number verified or not
  const [isNumberVerified, setIsNumberVerified] = useState(false);

  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    number: "",
    bio: "",
    avatar: ""
  });

  // if cancel then remove params
  const handleCancel = () => {
    setIsSubmitting(true);
    router.replace(pathname);
    setIsSubmitting(false);
  }

  useEffect(() => {
    if (user) {
      setUserInfo(user);
      if (user?.number) {
        setIsNumberVerified(true);
      }
      setIsLoading(false);
    }
  }, [loading]);

  // hanlde form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInfo.email || !userInfo.number || !userInfo.name || !userInfo.bio) {
      return toast.error("All Field Required!");
    }

    if (!isNumberVerified) {
      return toast.error("Number is not verified, please verify before saving!");
    }

    setIsSubmitting(true);

    // means avatar is changed and need to upload
    if (isAvatarChange) await handleUploadAvatar();

    try {
      const response = await fetch('/api/user/update/basic', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userInfo.name,
          number: userInfo.number,
          email: userInfo.email,
          bio: userInfo.bio
        })
      });
      const result = await response.json();

      if (response.ok) {
        // success msg
        toast.success(result.message);
        // update context
        await updateUser();
        // remove ?editing=true
        router.replace(pathname);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error updating profile", error);
      toast.error("Error Updating Data!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 10 digits
    if (/^\d{0,10}$/.test(value)) {
      setUserInfo(prev => ({ ...prev, number: value }));
    }

    setIsNumberVerified(false);
  };

  const handleSendOtp = async () => {
    if (!userInfo?.number) return toast.error("Number Required!");

    setIsSubmittingOtp(true);

    try {
      const response = await fetch('/api/phone-number/send-otp', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: userInfo.number }),
      });
      const result = await response.json();

      if (response.ok) {
        toast.success(result?.message);
        setIsOtpSent(true);
      } else {
        toast.error(result?.message);
      }
    } catch (error) {
      console.error("Error sending otp ", error);
      toast.error("Error while sending otp!");
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!userInfo?.number || !otp) return toast.error("OTP Required!");

    setIsSubmittingOtp(true);

    try {
      const response = await fetch('/api/phone-number/verify-otp', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: userInfo.number, otp: otp }),
      });
      const result = await response.json();

      if (response.ok) {
        toast.success(result?.message);
        setIsNumberVerified(true);
        setIsOtpSent(false);
      } else {
        toast.error(result?.message);
      }
    } catch (error) {
      console.error("Error verifing otp", error);
      toast.error("Error while verifing otp!");
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  const handleUploadAvatar = async () => {
    if (!file) return toast.error("Image not found!");

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload to Cloudinary
      const response = await fetch('/api/user/update/avatar', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result?.message);
      } else {
        toast.error(result?.message);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  if (isLoading) return <LoadingAnimation />;

  return (
    <div className="space-y-6 w-full">
      <div className="space-y-2">
        <Heading title="Profile Information" />
        <p className="text-muted-foreground text-sm md:text-base px-0 md:px-4">
          Update your personal information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 mx-auto max-w-2xl">
        <ProfilePhoto userInfo={userInfo} setFile={setFile} setIsAvatarChange={setIsAvatarChange} />

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={userInfo.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2 cursor-not-allowed">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              value={userInfo.email}
              disabled
              className="text-sm sm:text-base opacity-70"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="number">Phone Number</Label>
            <div className="flex gap-4">
              <div className="cursor-not-allowed">
                <Input
                  id="phone_country_code"
                  name="phone_country_code"
                  value="+91"
                  disabled
                  className="w-12 text-sm sm:text-base"
                />
              </div>
              <Input
                id="number"
                name="number"
                value={userInfo.number}
                onChange={handlePhoneChange}
                placeholder="Enter your phone number"
                maxLength={10}
                type="tel"
                pattern="[0-9]{10}"
                disabled={isOtpSent}
                className="text-sm sm:text-base"
              />
              {isOtpSent &&
                <InputOTP maxLength={6} onChange={(value) => setOtp(value)}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              }
              <Button
                type="button"
                variant="secondary"
                className="cursor-pointer text-sm sm:text-base"
                disabled={isSubmittingOtp || isNumberVerified}
                onClick={isOtpSent ? handleVerifyOtp : handleSendOtp}
              >
                {isSubmittingOtp
                  ? isOtpSent
                    ?
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifing...
                    </>
                    : <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  : isNumberVerified
                    ? "Verified"
                    : isOtpSent
                      ? "Verify OTP"
                      : "Send OTP"
                }
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={userInfo.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              className="min-h-[100px] text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancel}
            disabled={isSubmitting || isSubmittingOtp}
            className="cursor-pointer text-sm sm:text-base"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="secondary"
            disabled={isSubmitting || isSubmittingOtp}
            className="cursor-pointer text-sm sm:text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;