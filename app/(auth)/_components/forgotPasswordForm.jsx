"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import Form from "next/form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ForgotPasswordForm = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    email: "",
  });
  const [errorMsg, setErrorMsg] = useState({
    email: "",
  });

  const handleDataChange = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMsg((prev) => ({ ...prev, [e.target.name]: "" }));
  }

  const handleResetLink = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!data?.email) return setErrorMsg((prev) => ({ ...prev, email: "Email Required!" }));

    try {
      const response = await fetch("/api/mail/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data?.email }),
      });
      const result = await response.json();

      if (response.ok) {
        toast.success(result?.message);
        setData((prev) => ({ ...prev, email: "" }));
        router.push('/login');
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
    <>
      <Form onSubmit={handleResetLink} className="flex mx-auto items-center flex-col gap-6 w-4/5 sm:w-2/3 md:w-3/4 lg:w-1/2">
        <div className="flex flex-col gap-1.5 w-full">
          <Label
            htmlFor="email"
            className="text-sm md:text-base"
          >
            Email
          </Label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={data?.email || ""}
            onChange={handleDataChange}
          />
          {errorMsg?.email &&
            <span className="text-red-700 text-xs md:text-sm">
              {errorMsg?.email}
            </span>
          }
        </div>

        <Button variant="secondary" className="cursor-pointer px-8 md:px-16" disabled={isLoading}>
          {isLoading && <Loader2 className="animate-spin" />}
          {isLoading ? "Finding Password" : "Find Password"}
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
    </>
  )
}

export default ForgotPasswordForm
