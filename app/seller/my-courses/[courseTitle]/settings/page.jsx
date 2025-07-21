"use client";

import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogAction, AlertDialogCancel
} from "@/components/ui/alert-dialog";
import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import { useParams, useRouter } from "next/navigation";
import LoadingAnimation from "@/components/SubLoader";
import CourseSettingForm from "./_components/Form";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import OTPVerifyDialog from "@/components/OTPVerifyDialog";

const Settings = () => {
  const searchParams = useParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [courseData, setCourseData] = useState(null);

  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otp, setOtp] = useState("");

  const fetchCourse = async () => {
    if (!searchParams?.courseTitle) return;

    try {
      const response = await fetch(`/api/seller/course?title=${searchParams?.courseTitle}`, { method: "GET" });
      const result = await response.json();

      if (response.ok) {
        setCourseData(result?.course);
      }
    } catch (error) {
      console.log('Error while fetching course data ', error);
      toast.error("Internal Server Error, Try Again Later!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  const handleSendOtp = async () => {
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
      setShowLoadingDialog(false); // Hide loading dialog
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();

    if (!courseData?.title) return toast.error("Course Not Found!");
    if (!otp) return toast.error("OTP Required!");
    setSubmitting(true);

    try {
      const response = await fetch(`/api/seller/course?title=${courseData?.title}&otp=${otp}`, { method: "DELETE" });
      const result = await response.json();

      if (response.ok) {
        toast.success(result?.message);
        router.push('/seller/my-courses');
      } else {
        toast.error(result?.message);
        setSubmitting(false);
      }
    } catch (error) {
      console.log('Error while deleting course ', error);
      toast.error("Internal Server Error, Try again later!");
      setSubmitting(false);
    }
  };

  if (isLoading) return <LoadingAnimation />;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {!editMode ? (
        <>
          <Card className="bg-gray-900 border-gray-700 text-gray-200">
            <CardHeader>
              <CardTitle>Course Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-1">
                <span className="text-gray-400">Thumbnail:</span>
                <img
                  src={courseData?.thumbnail}
                  alt={courseData?.title}
                  className="w-64 h-40 object-cover rounded-md border border-gray-700"
                />
              </div>
              <div>
                <span className="text-gray-400">Title:</span> {courseData?.title}
              </div>
              <div>
                <span className="text-gray-400">Description:</span> {courseData?.description}
              </div>
              <div>
                <span className="text-gray-400">Status:</span> {courseData?.status}
              </div>
              <div>
                <span className="text-gray-400">Approved by Admin:</span> {courseData?.isApproved ? "Yes" : "No"}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700 text-gray-200">
            <CardHeader>
              <CardTitle>Pricing & Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">Paid Course:</span> {courseData?.isPaid ? "Yes" : "No"}
              </div>
              {courseData?.isPaid && (
                <>
                  <div>
                    <span className="text-gray-400">Total Price:</span> ₹{courseData?.totalPrice}
                  </div>
                  <div>
                    <span className="text-gray-400">Discounted Price:</span> ₹{courseData?.actualPrice}
                  </div>
                  <div className="text-xs text-green-400">
                    Earnings: <span className="font-semibold">₹{(courseData?.actualPrice * 0.95).toFixed(2)}</span> per user (after 5% platform fee).
                  </div>
                </>
              )}
              <div>
                <span className="text-gray-400">Course Validity:</span> {courseData?.validityDays} days
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700 text-gray-200">
            <CardHeader>
              <CardTitle>Manage Course</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-gray-300">Want to update course details or pricing?</p>
                <p className="text-xs text-gray-400">Edit your course anytime to keep information up-to-date.</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setEditMode(true)} className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                  Edit Course
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" className="hover:bg-red-700 cursor-pointer">
                      Delete Course
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-gray-900 border-gray-700 text-gray-200">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                      <AlertDialogDescription>
                        Deleting this course will permanently remove it along with all its chapters, enrollments, and reviews. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer text-black">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleSendOtp}
                        disabled={submitting}
                        className="bg-red-600 hover:bg-red-700 cursor-pointer"
                      >
                        {submitting
                          ? <><Loader2 className="h-8 w-8 animate-spin" /> Deleting...</>
                          : "Yes, delete permanently"
                        }
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          <OTPVerifyDialog
            showLoadingDialog={showLoadingDialog}
            setShowLoadingDialog={setShowLoadingDialog}
            showOTPDialog={showOTPDialog}
            setShowOTPDialog={setShowOTPDialog}
            otp={otp}
            setOtp={setOtp}
            handleOTPVerification={handleDelete}
            isLoading={submitting}
            finalMessage="Enter it below to confirm course deletion."
          />
        </>
      ) :
        <CourseSettingForm
          courseData={courseData}
          setCourseData={setCourseData}
          setEditMode={setEditMode}
          submitting={submitting}
          setSubmitting={setSubmitting}
        />
      }
    </div>
  );
};

export default Settings;
