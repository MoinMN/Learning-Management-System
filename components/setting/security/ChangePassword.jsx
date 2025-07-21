"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import OTPVerification from "@/app/(auth)/_components/otp";
import BackButton from "@/components/BackButton";
import Heading from "../Heading";


const ChangePassword = () => {
  const router = useRouter();
  const { user, loading } = useUser();
  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isOtpSend, setIsOtpSend] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value, }));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
      return toast.error("All Fields Required!");
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      return toast.warning("New passwords do not match");
    }

    setIsSendingOtp(true);

    try {
      const response = await fetch('/api/mail/otp', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result?.message);
        setIsOtpSend(true);
      } else {
        toast.error(result?.message);
      }
    } catch (error) {
      console.log('Error while sending OTP ', error);
      toast.error(error.message || "Error while sending OTP!");
    } finally {
      setIsSendingOtp(false);
    }
  }

  const handleSubmit = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
      return toast.error("All Fields Required!");
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      return toast.warning("New passwords do not match");
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/user/password/update', {
        method: "POST",
        headers: { 'Content-Type': "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result?.message);
        setFormData({ currentPassword: "", newPassword: "", confirmNewPassword: "", });
      } else {
        toast.error(result?.message);
      }
    } catch (error) {
      console.log('Error while changing password ', error);
      toast.error("Internal Server Error, Try again later!");
    } finally {
      setIsSubmitting(false);
      setIsOtpSend(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    setFormData((prev) => ({ ...prev, email: user?.email }));
  }, [loading]);

  return (
    <div className="w-full px-2 py-2 md:px-4">
      {/* Back + Header */}
      <BackButton handleOnClick={() => router.back()} />
      <Heading title="Change Password" />

      <div className="py-4 mx-auto max-w-xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Current Password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              type="password"
              name="currentPassword"
              id="currentPassword"
              placeholder="Enter current password"
              value={formData.currentPassword}
              onChange={handleChange}
              disabled={isOtpSend}
              className="text-sm sm:text-base"
            />
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              type="password"
              name="newPassword"
              id="newPassword"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={handleChange}
              disabled={isOtpSend}
              className="text-sm sm:text-base"
            />
          </div>

          {/* Confirm New Password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
            <Input
              type="password"
              name="confirmNewPassword"
              id="confirmNewPassword"
              placeholder="Re-enter new password"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              disabled={isOtpSend}
              className="text-sm sm:text-base"
            />
          </div>

          <Button
            variant="secondary"
            className={`w-fit ${isSendingOtp ? "cursor-progress" : isOtpSend ? "cursor-not-allowed" : "cursor-pointer"} text-sm sm:text-base`}
            disabled={isSendingOtp || isOtpSend}
            onClick={handleSendOtp}
          >
            {isSendingOtp ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending OTP...
              </>
            ) :
              isOtpSend
                ? "OTP Sended"
                : "Change Password"
            }
          </Button>
        </form>

        {isOtpSend && (
          <div className="py-4">
            <h3 className="text-2xl font-semibold text-white mb-4 border-b border-zinc-800 pb-2">
              Verify Email
            </h3>
            <OTPVerification
              boxCenter={false}
              handleSubmit={handleSubmit}
              setData={setFormData}
              data={formData}
              isLoading={isSubmitting}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangePassword;
