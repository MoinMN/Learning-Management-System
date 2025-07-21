import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import Form from "next/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// para => (after submit func, form data set func, loading var)
const OTPVerification = ({ handleSubmit, setData, data, isLoading, boxCenter }) => {

  const maskEmail = (email) => {
    if (!email) return;
    const [user, domain] = email.split("@");
    const maskedUser = user.slice(0, 3) + "***";
    return `${maskedUser}@${domain}`;
  }

  return (
    <>
      <p className={`text-sm sm:text-base ${boxCenter ? "text-center" : "text-left"} text-gray-300 mb-4`}>
        OTP sent to <span className="font-semibold text-white">{maskEmail(data?.email)}</span>
      </p>

      <Form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className={`flex ${boxCenter ? "mx-auto items-center" : ""} flex-col gap-6 w-4/5 sm:w-2/3 md:w-3/4 lg:w-1/2`}
      >
        <InputOTP maxLength={6} onChange={(value) => setData((prev) => ({ ...prev, otp: value }))}>
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
        <Button variant="secondary" className="cursor-pointer px-16 w-fit text-sm md:text-base" disabled={isLoading}>
          {isLoading && <Loader2 className="animate-spin" />}
          {isLoading ? "Verifying" : "Verify"}
        </Button>
      </Form>
    </>
  )
}

export default OTPVerification;