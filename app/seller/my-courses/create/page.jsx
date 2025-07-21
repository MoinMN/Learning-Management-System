"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeading } from "@/components/Headers";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Form from "next/form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const CreateCourse = () => {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    thumbnail: "",
    validityDays: "",
    category: "",
    isPaid: false,
    status: "UNPUBLISHED",
    totalPrice: "",
    actualPrice: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
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
      const response = await fetch('/api/seller/course', { method: "POST", body: formData });
      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        router.push('/seller/my-courses');
      } else {
        toast.error(result.message);
        setSubmitting(false);
      }
    } catch (error) {
      console.log('Error while create course ', error);
      toast.error("Internal Server Error, Try Again Later!");
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-2">
      <PageHeading>Create New Course</PageHeading>

      <Form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto my-6">

        {/* SIMPLE INPUTS */}
        {[
          { label: "Title", name: "title", placeholder: "Course Title" },
          { label: "Category", name: "category", placeholder: "Category" },
        ].map((input) => (
          <div key={input.name} className="flex flex-col gap-1">
            <span className="text-xs md:text-sm text-gray-400">{input.label}</span>
            <Input
              name={input.name}
              value={courseData[input.name]}
              onChange={handleChange}
              placeholder={input.placeholder}
              className="text-xs md:text-sm hover:border-gray-500 transition-colors"
            />
          </div>
        ))}

        {/* DESCRIPTION */}
        <div className="flex flex-col gap-1">
          <span className="text-xs md:text-sm text-gray-400">Description</span>
          <Textarea
            name="description"
            value={courseData.description}
            onChange={handleChange}
            placeholder="Course Description"
            className="text-xs md:text-sm hover:border-gray-500 transition-colors"
          />
        </div>

        <div className="flex gap-2 md:gap-4 flex-wrap md:flex-nowrap items-center justify-between">
          {/* THUMBNAIL INPUTS */}
          <div className="flex flex-col gap-1 md:gap-2 w-fit">
            <span className="text-xs md:text-sm text-gray-400">Thumbnail Image</span>
            <Input
              name="thumbnail"
              type="file"
              accept="image/*"
              onChange={(e) => setCourseData((prev) => ({ ...prev, thumbnail: e.target?.files?.[0] }))}
              className="file:text-white file:text-xs md:file:text-sm cursor-pointer hover:border-gray-500 transition-colors"
            />
          </div>

          {/* PAID SWITCH */}
          <div className="flex items-center gap-4">
            <span className="text-gray-300 text-sm">Paid Course?</span>
            <Switch
              checked={courseData.isPaid}
              onCheckedChange={(checked) =>
                setCourseData((prev) => ({
                  ...prev,
                  isPaid: checked,
                  totalPrice: checked ? prev.totalPrice : "",
                  actualPrice: checked ? prev.actualPrice : "",
                }))
              }
              className='data-[state=checked]:bg-green-500 bg-zinc-700 border border-zinc-600 
        relative inline-flex h-6 w-9 items-center rounded-full transition-colors cursor-pointer'
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform 
          ${courseData.isPaid ? 'translate-x-5' : 'translate-x-1'}`}
              />
            </Switch>
          </div>

          {/* STATUS SELECT */}
          <div className="flex flex-col gap-1 md:gap-2">
            <span className="text-xs md:text-sm text-gray-400">Status</span>
            <Select
              value={courseData.status}
              onValueChange={(val) => setCourseData((prev) => ({ ...prev, status: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent
                className="bg-[#1e1e1e] border border-gray-700 text-white cursor-pointer"
              >
                {["PUBLISHED", "UNPUBLISHED"].map((status) => (
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
        </div>

        {/* NUMBER INPUTS */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2 md:gap-4">
          {[
            { title: "Course Validity (In Days)", name: "validityDays", placeholder: "Course Duration (In Days)", disabled: false },
            { title: "Price Before Discount", name: "totalPrice", placeholder: "Total Price (₹)", disabled: !courseData.isPaid },
            { title: "Price Arfter Discount", name: "actualPrice", placeholder: "Discounted Price (₹)", disabled: !courseData.isPaid },
          ].map((input) => (
            <div
              key={input.name}
              className={`flex flex-col gap-1 md:gap-2 w-full ${input.disabled ? "cursor-not-allowed" : ""}`}
            >
              <span className="text-xs md:text-sm text-gray-400">{input.title}</span>
              <Input
                key={input.name}
                name={input.name}
                type="number"
                value={courseData[input.name]}
                onChange={handleChange}
                placeholder={input.placeholder}
                className="text-xs md:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none hover:border-gray-500 transition-colors"
                disabled={input.disabled}
              />
            </div>
          ))}
        </div>

        {/* 95% earnings note */}
        {courseData.isPaid && courseData.totalPrice && courseData.actualPrice && (
          <p className="text-xs md:text-sm text-green-400">
            You will receive <span className="font-semibold">₹{Math.round(courseData.actualPrice * 0.95)}</span> per user who buys your course (after 5% developer fee).
          </p>
        )}

        <div className="flex items-center justify-around pt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                className="cursor-pointer px-4 md:px-8"
              >
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gray-950 border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  Are you sure you want to cancel? All changes will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction
                  onClick={() => router.back()}
                  className="bg-red-600 hover:bg-red-700 cursor-pointer"
                >
                  Yes, discard
                </AlertDialogAction>
                <AlertDialogCancel className="text-black cursor-pointer">
                  No, keep editing
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            type="submit"
            variant="secondary"
            className="cursor-pointer px-4 md:px-8"
            disabled={submitting}
          >
            {submitting
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
              : "Create"
            }
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateCourse;
