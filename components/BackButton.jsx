import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const BackButton = ({ handleOnClick }) => {
  return (
    <Button
      variant="ghost"
      type="button"
      onClick={handleOnClick}
      className="w-fit text-sm text-muted-foreground px-0 mb-2 cursor-pointer"
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      Back
    </Button>
  )
}

export default BackButton
