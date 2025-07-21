import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogAction, AlertDialogCancel
} from "@/components/ui/alert-dialog";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "@/components/ui/select";
import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Form from "next/form";

const CourseSettingForm = ({
  courseData,
  setCourseData,
  setEditMode,
  submitting,
  setSubmitting
}) => {
  const router = useRouter();

  const handleChange = (e) => setCourseData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSwitch = (checked) => {
    setCourseData(prev => ({
      ...prev,
      isPaid: checked,
      totalPrice: checked ? prev.totalPrice : "",
      actualPrice: checked ? prev.actualPrice : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !courseData.id ||
      !courseData.title ||
      !courseData.description ||
      !courseData.category ||
      !courseData.thumbnail ||
      !courseData.validityDays ||
      (courseData.isPaid && (!courseData.actualPrice || !courseData.totalPrice))
    ) {
      return toast.error("All fields are mandatory!");
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("id", courseData.id);
    formData.append("title", courseData.title);
    formData.append("description", courseData.description);
    formData.append("category", courseData.category);
    formData.append("isPaid", courseData.isPaid.toString());
    formData.append("status", courseData.status);
    formData.append("thumbnail", courseData.thumbnail);
    formData.append("validityDays", courseData.validityDays);

    if (courseData.isPaid) {
      formData.append("totalPrice", courseData.totalPrice);
      formData.append("actualPrice", courseData.actualPrice);
    }

    try {
      const response = await fetch('/api/seller/course', { method: "PUT", body: formData });
      const result = await response.json();

      if (response.ok) {
        toast.success(result?.message);
        setCourseData(result?.course);
        router.push(`../${encodeURIComponent(result?.course?.title).replace(/%20/g, "+")}/settings`)
        setEditMode(false);
      } else {
        toast.error(result?.message);
      }
    } catch (error) {
      console.log('Error while updating course data ', error);
      toast.error("Internal Server Error, Try again later!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="space-y-6">
      <Card className="bg-gray-900 border-gray-700 text-gray-200">
        <CardHeader>
          <CardTitle>Edit Course Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-xs text-gray-400">Title</span>
            <Input
              name="title"
              value={courseData?.title}
              onChange={handleChange}
              placeholder="Course Title"
              className="mt-1"
            />
          </div>
          <div>
            <span className="text-xs text-gray-400">Description</span>
            <Textarea
              name="description"
              value={courseData?.description}
              onChange={handleChange}
              placeholder="Brief course description"
              className="mt-1"
            />
          </div>
          <div>
            <span className="text-xs text-gray-400">Thumbnail Image</span>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setCourseData((prev) => ({ ...prev, thumbnail: e.target.files[0] }))}
              className="file:text-white file:text-xs md:file:text-sm cursor-pointer hover:border-gray-500 transition-colors"
            />
          </div>
          <div>
            <span className="text-xs text-gray-400">Status</span>
            <Select
              value={courseData?.status}
              onValueChange={(val) => setCourseData(prev => ({ ...prev, status: val }))}
            >
              <SelectTrigger className="mt-1 cursor-pointer">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent
                className="bg-[#1e1e1e] border border-gray-700 text-white cursor-pointer"
              >
                {["PUBLISHED", "UNPUBLISHED"].map(status => (
                  <SelectItem
                    key={status}
                    value={status}
                    className="focus:bg-gray-700 focus:text-white cursor-pointer"
                  >
                    {status[0] + status.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-700 text-gray-200">
        <CardHeader>
          <CardTitle>Update Pricing & Validity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Is this a paid course?</span>
            <Switch
              checked={courseData?.isPaid}
              onCheckedChange={handleSwitch}
              className="data-[state=checked]:bg-green-500 bg-zinc-700 border border-zinc-600 cursor-pointer"
            />
          </div>
          {courseData?.isPaid && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="totalPrice"
                type="number"
                value={courseData?.totalPrice}
                onChange={handleChange}
                placeholder="Total Price (₹)"
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Input
                name="actualPrice"
                type="number"
                value={courseData?.actualPrice}
                onChange={handleChange}
                placeholder="Discounted Price (₹)"
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="col-span-2 text-xs text-green-400 mt-1">
                You will receive ₹{(courseData?.actualPrice * 0.95).toFixed(2)} per user (after 5% platform fee).
              </div>
            </div>
          )}
          <div>
            <span className="text-xs text-gray-400">Validity (days)</span>
            <Input
              name="validityDays"
              type="number"
              value={courseData?.validityDays}
              onChange={handleChange}
              placeholder="E.g. 30 days access"
              className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        {/* Cancel Confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              className="bg-gray-700 hover:bg-gray-600 cursor-pointer"
            >
              Cancel
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-900 border-gray-700 text-gray-200">
            <AlertDialogHeader>
              <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel? All unsaved changes will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-black cursor-pointer">Keep Editing</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => setEditMode(false)}
                className="bg-red-600 hover:bg-red-700 cursor-pointer"
              >
                Yes, discard
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Save Confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              className="bg-green-600 hover:bg-green-700 cursor-pointer"
            >
              Save Changes
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-900 border-gray-700 text-gray-200">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Save</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to save these changes? This will update your course details immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-black cursor-pointer">Review Again</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 cursor-pointer"
              >
                {submitting
                  ? <><Loader2 className="h-8 w-8 animate-spin" /> Submitting...</>
                  : "Yes, Save"
                }
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Form>
  )
}

export default CourseSettingForm
