import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from "@/components/ui/alert-dialog";
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem
} from "@/components/ui/select";
import { PageHeading } from "@/components/Headers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

// import Jodit using next/dynamic so it only loads client-side
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

const ChapterForm = ({
  title,
  chapterData,
  setChapterData,
  submitting,
  handleSubmit,
  handleCancelDialogAction
}) => {
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setChapterData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  return (
    <div className="px-4 py-2">
      <PageHeading>{title}</PageHeading>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto my-6">

        <div className="flex flex-col gap-1">
          <span className="text-xs md:text-sm text-gray-400">
            Chapter Title <span className="text-red-500">*</span>
          </span>
          <Input
            name="title"
            value={chapterData?.title}
            onChange={handleChange}
            placeholder="Eg.: Basics of Javascript"
            className="text-xs md:text-sm hover:border-gray-500 transition-colors"
            disabled={submitting}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs md:text-sm text-gray-400">Notes</span>
          <div className="border border-gray-700 rounded-md overflow-hidden focus-within:border-gray-500 transition-colors">
            <JoditEditor
              value={chapterData?.notes}
              tabIndex={1}
              onBlur={newContent => setChapterData(prev => ({ ...prev, notes: newContent }))}
              config={{
                readonly: submitting,
                height: 400,
                theme: "dark",
                toolbarSticky: false,
                toolbarAdaptive: false,
                toolbarButtonSize: "small",
                showCharsCounter: false,
                showWordsCounter: false,
                showXPathInStatusbar: false,
                style: {
                  background: "#0c0c0c",
                  color: "#e4e4e7",
                  border: "none"
                }
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1 w-fit">
            <span className="text-xs md:text-sm text-gray-400">Upload Video</span>
            <Input
              type="file"
              name="videoUrl"
              accept="video/*"
              onChange={handleChange}
              className="file:text-white file:text-xs md:file:text-sm cursor-pointer hover:border-gray-500 transition-colors"
              disabled={submitting}
            />
          </div>
          <div className="flex flex-col gap-1 w-fit">
            <span className="text-xs md:text-sm text-gray-400">Upload PDF</span>
            <Input
              type="file"
              name="pdfUrl"
              accept="application/pdf"
              onChange={handleChange}
              className="file:text-white file:text-xs md:file:text-sm cursor-pointer hover:border-gray-500 transition-colors"
              disabled={submitting}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 w-fit">
          <span className="text-xs md:text-sm text-gray-400">
            Status <span className="text-red-500">*</span>
          </span>
          <Select
            value={chapterData?.status}
            onValueChange={(val) => setChapterData(prev => ({ ...prev, status: val }))}
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1e1e] border border-gray-700 text-white cursor-pointer">
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

        <div className="flex items-center justify-around pt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                className="cursor-pointer px-4 md:px-8"
                disabled={submitting}
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
                  onClick={handleCancelDialogAction}
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
              : "Create Chapter"
            }
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ChapterForm
