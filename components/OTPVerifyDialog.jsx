import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { Button } from "./ui/button"


const OTPVerifyDialog = ({
  showLoadingDialog,
  setShowLoadingDialog,
  showOTPDialog,
  setShowOTPDialog,
  otp,
  setOtp,
  handleOTPVerification,
  isLoading,
  finalMessage,
}) => {
  return (
    <>
      {/* Loading Dialog */}
      <Dialog open={showLoadingDialog} onOpenChange={setShowLoadingDialog}>
        <DialogContent className="bg-gray-900 border border-gray-800 text-white max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Note:</DialogTitle>
            <DialogDescription className="flex flex-col items-center justify-center gap-4 py-4 sm:py-8 text-xs sm:text-sm">
              <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-red-500" />
              <span className="text-base sm:text-lg font-medium text-center">Sending OTP to your email...</span>
              <span className="text-sm text-gray-400 text-center">Please wait while we verify your request</span>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* OTP Verification Dialog */}
      <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
        <DialogContent className="bg-gray-900 border border-gray-800 text-white max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Verify Your Identity</DialogTitle>
            <DialogDescription className="text-gray-300 text-sm sm:text-base">
              {`We've sent a 6-digit OTP to your registered email. ${finalMessage}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white text-sm sm:text-base"
              maxLength={6}
            />
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowOTPDialog(false)}
                className="border-gray-700 text-black w-full sm:w-auto cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleOTPVerification}
                disabled={otp.length !== 6 || isLoading}
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto cursor-pointer"
              >
                {isLoading ? (
                  <span className="animate-pulse">Verifying...</span>
                ) : (
                  "Confirm Deletion"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default OTPVerifyDialog
