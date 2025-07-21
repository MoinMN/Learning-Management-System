'use client';

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import OTPVerification from "@/app/(auth)/_components/otp";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import Heading from "../Heading";

const ResetPassword = () => {
  const router = useRouter();

  const { user, loading } = useUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [isOtpSend, setIsOtpSend] = useState(false);
  const [data, setData] = useState({ email: "", otp: "" });

  const handleSendOtp = async () => {
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
  };

  const handleSubmit = async () => {
    if (!data?.email) return;
    if (!data?.otp) return toast.error("OTP Requried!");

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/mail/reset-password', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result?.message);
        setIsOtpSend(false);
      } else {
        toast.error(result?.message);
      }
    } catch (error) {
      console.log('Error sending reset link ', error);
      toast.error(error.message || "Try again later!");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    setData((prev) => ({ ...prev, email: user?.email }));
  }, [loading]);

  return (
    <div className="w-full px-2 py-2 md:px-4 space-y-6">
      {/* Back Button */}
      <BackButton handleOnClick={() => router.back()} />

      {/* Header */}
      <Heading title="Reset Password" />

      {/* Reset Button */}
      <div className="flex flex-col justify-center items-center gap-4 mt-6 max-w-xl mx-auto">
        <div className="flex flex-col justify-center items-center gap-4">
          <p className="text-left text-sm text-muted-foreground">
            To reset your password, click on the button below. A reset link will be sent to your registered email address. The link will expire in 1 hour.
          </p>
          <Button
            onClick={handleSendOtp}
            variant="secondary"
            disabled={isSendingOtp || isOtpSend}
            className="w-fit cursor-pointer text-sm sm:text-base"
          >
            {isSendingOtp ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending OTP...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </div>

        {isOtpSend && (
          <div className="py-4">
            <h3 className="text-xl md:text-2xl text-center font-semibold text-white mb-4 border-b border-zinc-800 pb-2">
              Verify Email
            </h3>
            <OTPVerification
              boxCenter={true}
              handleSubmit={handleSubmit}
              setData={setData}
              data={data}
              isLoading={isSubmitting}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default ResetPassword;
