'use client';

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Heading from "@/components/setting/Heading";
import BackButton from "@/components/BackButton";

const SellerConnectWalletForm = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [formData, setFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    uidai: '',
    pan: '',
    method: 'account',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData?.accountHolderName
      || !formData?.uidai
      || !formData?.pan
      || !(formData?.accountNumber && formData?.ifscCode)
      && !formData?.upiId) {
      return toast.error("All Field Required!");
    }
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/cashfree/vendor', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        // remove ?editing=true
        router.replace(pathname);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error creating acount", error);
      toast.error("Error creating account!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMethodChange = (value) => {
    setFormData(prev => ({
      ...prev,
      method: value,
      accountNumber: "",
      ifscCode: "",
      upiId: ""
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="w-full px-2 md:px-4 flex flex-col gap-2 md:gap-4">
      {/* Header */}
      <div className="">
        <BackButton handleOnClick={() => router.replace(`${pathname}`)} />
        <Heading title="Connect Wallet" />
        <p className="text-left text-muted-foreground text-sm mt-2 px-2 md:px-4">
          Don't worry, your information is safe. All data is end-to-end encrypted and securely shared only with Cashfree for transaction processing.
        </p>
      </div>

      <div className="max-w-xl mx-auto flex flex-col gap-4 w-full">
        {/* Payment Method Selection */}
        <div className="flex flex-col gap-2">
          <Label>Payment Method</Label>
          <RadioGroup
            defaultValue={formData.method || "account"}
            onValueChange={handleMethodChange}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2 cursor-pointer">
              <RadioGroupItem
                value="account"
                id="account"
                className="border-white text-white data-[state=checked]:bg-white data-[state=checked]:text-black"
              />
              <Label htmlFor="account" className="cursor-pointer">Account Transfer</Label>
            </div>
            <div className="flex items-center space-x-2 cursor-pointer">
              <RadioGroupItem
                value="upi"
                id="upi"
                className="border-white text-white data-[state=checked]:bg-white data-[state=checked]:text-black"
              />
              <Label htmlFor="upi" className="cursor-pointer">UPI Transfer</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Common Fields */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="accountHolderName">Account Holder Name</Label>
          <Input
            name="accountHolderName"
            placeholder="e.g. John Doe"
            value={formData.accountHolderName}
            onChange={handleChange}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="uidai">UIDAI (Aadhaar)</Label>
          <Input
            name="uidai"
            placeholder="e.g. 123456789012"
            value={formData.uidai}
            onChange={handleChange}
            type="number"
            className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="pan">PAN</Label>
          <Input
            name="pan"
            placeholder="e.g. ABCDE1234F"
            value={formData.pan}
            onChange={handleChange}
          />
        </div>

        {/* Conditional Fields */}
        {formData.method === "account" && (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                name="accountNumber"
                placeholder="e.g. 1234567890"
                value={formData.accountNumber}
                onChange={handleChange}
                type="number"
                className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input
                name="ifscCode"
                placeholder="e.g. HDFC0001234"
                value={formData.ifscCode}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {formData.method === "upi" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="upiId">UPI ID</Label>
            <Input
              name="upiId"
              placeholder="e.g. john@upi"
              value={formData.upiId}
              onChange={handleChange}
            />
          </div>
        )}

        <Button
          variant="secondary"
          type="submit"
          className="mt-4 cursor-pointer w-fit mx-auto px-4"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            )
            : "Submit"}
        </Button>
      </div>
    </form>
  );
};

export default SellerConnectWalletForm;
