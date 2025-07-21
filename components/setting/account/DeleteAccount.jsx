"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { signOutWithCleanup } from "@/utility/signout";
import OTPVerifyDialog from "@/components/OTPVerifyDialog";

const DeleteAccount = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const [otp, setOtp] = useState("");

  const handleDeleteAccount = async () => {
    setIsSendingOtp(true);
    setShowLoadingDialog(true); // Show loading dialog immediately
    // send OTP
    try {
      const respose = await fetch('/api/mail/otp', { method: "POST" });

      const result = await respose.json();
      if (respose.ok) {
        toast.success(result?.message);
        setShowOTPDialog(true);         // Show OTP dialog
      } else {
        toast.error(result?.message);
      }
    } catch (error) {
      console.log('Error while sending otp ', error);
      toast.error("There was a problem with your request.");
    } finally {
      setIsSendingOtp(false);
      setShowLoadingDialog(false); // Hide loading dialog
    }
  };

  const handleOTPVerification = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/user/delete?otp=${otp}`, { method: "DELETE", });
      const result = await response.json();
      if (response.ok) {
        toast.success(result?.message);
        signOutWithCleanup();
      } else {
        toast.error(result?.message || "Internal Server Error, Try Again Later!");
        setIsLoading(false);
      }
    } catch (error) {
      toast.error(result?.message || "Internal Server Error, Try Again Later!");
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gray-900 border border-gray-800 text-white">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Delete or Deactivate Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm sm:text-base text-muted-foreground">
          You can request account deletion. A confirmation process will verify your identity before deletion.
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full sm:w-fit cursor-pointer text-xs sm:text-sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete My Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-900 border border-gray-800 text-white max-w-[95vw] sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg sm:text-xl">Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300 text-sm sm:text-base">
                By confirming, you request immediate account deactivation. Your data will be
                permanently deleted after 30 days. During this period, you can cancel the deletion
                by logging back into your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 text-xs sm:text-sm">
              <AlertDialogCancel className="text-black w-full sm:w-auto cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto cursor-pointer"
                disabled={isSendingOtp}
              >
                Verify & Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <OTPVerifyDialog
          showLoadingDialog={showLoadingDialog}
          setShowLoadingDialog={setShowLoadingDialog}
          showOTPDialog={showOTPDialog}
          setShowOTPDialog={setShowOTPDialog}
          otp={otp}
          setOtp={setOtp}
          handleOTPVerification={handleOTPVerification}
          isLoading={isLoading}
          finalMessage="Enter it below to confirm account deletion."
        />
      </CardContent>
    </Card>
  );
};

export default DeleteAccount;