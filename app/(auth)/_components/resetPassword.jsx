"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Form from "next/form";
import Link from "next/link";


const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      return setMessage("Password & Confirm Password Required!");
    }
    if (password !== confirmPassword) {
      return setMessage("Password & Confirm Password Not Matched !");
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/credentials/reset-password', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const result = await response.json();
      if (response?.ok) {
        toast.success(result?.message);
        setPassword("")
        setConfirmPassword("")
      } else {
        toast.error(result?.message);
      }
    } catch (error) {
      console.log('Error while sending mail ', error);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form onSubmit={handleResetPassword} className="flex mx-auto items-center flex-col gap-4 w-4/5 sm:w-2/3 md:w-3/4 lg:w-1/2">
      <div className="flex flex-col gap-1.5 w-full">
        <Label
          htmlFor="password"
          className="text-sm md:text-base"
        >
          Password
        </Label>
        <Input
          type="password"
          id="password"
          name="password"
          placeholder="Password"
          value={password || ""}
          onChange={(e) => { setPassword(e.target.value) }}
        />
      </div>
      <div className="flex flex-col gap-1.5 w-full">
        <Label
          htmlFor="confirmPassword"
          className="text-sm md:text-base"
        >
          Confirm Password
        </Label>
        <Input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={confirmPassword || ""}
          onChange={(e) => { setConfirmPassword(e.target.value) }}
        />
        {message &&
          <span className="text-red-700 text-xs md:text-sm">
            {message}
          </span>
        }
      </div>

      <Button variant="secondary" className="cursor-pointer px-16" disabled={isLoading}>
        {isLoading && <Loader2 className="animate-spin" />}
        {isLoading ? "Resetting" : "Reset"}
      </Button>

      <div className="flex flex-col items-center text-center text-sm text-gray-400 space-y-2">
        <p>
          Back to Login Page!{" "}
          <Link
            href="/login"
            className="text-white font-semibold hover:text-slate-300 hover:underline transition-colors"
          >
            Click here
          </Link>
        </p>
      </div>
    </Form>
  )
}

export default ResetPasswordForm
