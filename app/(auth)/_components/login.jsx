"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Form from "next/form";

const LoginForm = () => {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (message) {
      // Map URL messages to toast notifications
      const messageMap = {
        'session-expired': 'Your session has expired. Please log in again.',
        'another-device': 'Someone logged in from another device.',
        'unauthorized': 'Please log in to access this page.',
      };

      // Use setTimeout to ensure toast container is ready
      const timer = setTimeout(() => {
        const toastMessage = messageMap[message] || message;
        toast.error(toastMessage, {
          position: 'top-center',
          duration: 5000
        });
      }, 300); // Slightly longer delay

      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleDataChange = (e) => {
    setData((prev => ({ ...prev, [e.target.name]: e.target.value })));
    setErrorMsg((prev) => ({ ...prev, [e.target.name]: "" }));
  }

  // login form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!data?.email || !data?.password) {
      if (!data?.email) setErrorMsg((prev) => ({ ...prev, email: "Email Required!" }));
      if (!data?.password) setErrorMsg((prev) => ({ ...prev, password: "Password Required!" }));
      return setIsLoading(false);
    }

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data?.email,
        password: data?.password
      });

      if (result?.error) {
        toast.error("Invalid Credentials!");
        return setIsLoading(false);
      }

      // Wait for session to update (important!)
      let session = await getSession();
      let attempts = 0;

      // Retry getting session for up to 3 seconds
      while (!session?.user && attempts < 6) {
        await new Promise(resolve => setTimeout(resolve, 500));
        session = await getSession();
        attempts++;
      }

      if (!session?.user) {
        toast.error("Login successful but session not loaded");
        return setIsLoading(false);
      }

      // Redirect based on role
      const redirectPath = {
        ADMIN: '/admin/dashboard',
        SELLER: '/seller/dashboard',
        VIEWER: '/viewer/dashboard'
      }[session.user.role] || '/viewer/dashboard';

      router.push(redirectPath);
      toast.success("Login Successful!");
    } catch (error) {
      console.log("Error while login ", error);
      toast.error("There was a problem with your request.");
      setIsLoading(false);
    }
  }

  return (
    <Form onSubmit={handleSubmit} className="flex mx-auto items-center flex-col gap-4 w-4/5 sm:w-2/3 md:w-3/4 lg:w-1/2">
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
          value={data?.password || ""}
          onChange={handleDataChange}
        />
        {errorMsg?.password &&
          <span className="text-red-700 text-xs md:text-sm">
            {errorMsg?.password}
          </span>
        }
      </div>
      <Button variant="secondary" className="cursor-pointer px-16" disabled={isLoading}>
        {isLoading && <Loader2 className="animate-spin" />}
        Log In
      </Button>
    </Form>
  )
}

export default LoginForm
