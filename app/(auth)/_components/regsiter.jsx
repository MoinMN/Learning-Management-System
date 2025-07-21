"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Form from "next/form";
import OTPVerification from "./otp";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProvidersBox from "./providers";

const register = ({ role, title }) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    email: "",
    name: "",
    password: "",
    confirm_password: "",
    otp: ""
  });
  const [errorMsg, setErrorMsg] = useState({
    email: "",
    name: "",
    password: "",
    confirm_password: "",
  });

  // activate OTP verification box if true
  const [startOtpVerify, setStartOtpVerify] = useState(false);

  const handleDataChange = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMsg((prev) => ({ ...prev, [e.target.name]: "" }));
  }

  // send OTP
  const handleStartVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let toReturn = false;
    if (!data?.name || !data?.email || !data?.password || !data?.confirm_password) {
      if (!data?.name) setErrorMsg((prev) => ({ ...prev, name: "Name Required!" }));
      if (!data?.email) setErrorMsg((prev) => ({ ...prev, email: "Email Required!" }));
      if (!data?.password) setErrorMsg((prev) => ({ ...prev, password: "Password Required!" }));
      if (!data?.confirm_password) setErrorMsg((prev) => ({ ...prev, confirm_password: "Confirm Password Required!" }));
      toReturn = true;
    }

    if (data?.password !== data?.confirm_password) {
      setErrorMsg((prev) => ({ ...prev, confirm_password: "Passwords Not Matched!" }));
      toReturn = true;
    }

    if (toReturn) return setIsLoading(false);

    try {
      const respose = await fetch('/api/mail/otp', {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify({ email: data?.email })
      });

      const result = await respose.json();
      if (respose.ok) {
        toast.success(result?.message);
        setStartOtpVerify(true);
      } else {
        toast.error(result?.message);
      }
    } catch (error) {
      console.log('Error while sending otp ', error);
      toast.error("There was a problem with your request.");
    } finally {
      setIsLoading(false);
    }
  }

  // Verify OTP & create user
  const handleCreateUser = async () => {
    setIsLoading(true);
    let toReturn = false;
    if (!data?.name || !data?.email || !data?.password || !data?.confirm_password || !data?.otp) {
      if (!data?.name) setErrorMsg((prev) => ({ ...prev, name: "Name Required!" }));
      if (!data?.email) setErrorMsg((prev) => ({ ...prev, email: "Email Required!" }));
      if (!data?.password) setErrorMsg((prev) => ({ ...prev, password: "Password Required!" }));
      if (!data?.confirm_password) setErrorMsg((prev) => ({ ...prev, confirm_password: "Confirm Password Required!" }));
      if (!data?.otp) toast.error("OTP Required!");
      toReturn = true;
    }

    if (data?.password !== data?.confirm_password) {
      setErrorMsg((prev) => ({ ...prev, confirm_password: "Passwords Not Matched!" }));
      toReturn = true;
    }

    if (toReturn) return setIsLoading(false);
    try {
      const respose = await fetch(`/api/auth/credentials/${role}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await respose.json();

      if (respose.ok) {
        toast.success(result?.message);
        router.push('/login');
      } else {
        toast.error(result?.message);
      }
    } catch (error) {
      console.log("Error: ", error);
      toast.error("There was a problem with your request.");
    } finally {
      setIsLoading(false);
    }
  }

  // inputs fields
  const inputList = [
    {
      label: "Name",
      name: "name",
      type: "text"
    },
    {
      label: "Email",
      name: "email",
      type: "email"
    },
    {
      label: "Password",
      name: "password",
      type: "password"
    },
    {
      label: "Confirm Password",
      name: "confirm_password",
      type: "password"
    },
  ];

  return (
    <>
      {startOtpVerify
        ?
        <div className="m-auto w-full md:w-3/4">
          <h3 className="text-xl sm:text-2xl md:text-4xl font_playwrite font-semibold text-center py-12">
            Verify Your Email
          </h3>
          <OTPVerification
            boxCenter={true}
            handleSubmit={handleCreateUser}
            data={data}
            setData={setData}
            isLoading={isLoading}
          />
        </div>
        :
        <>
          <div className="m-auto w-full md:w-3/4">
            <h3 className="text-4xl font_playwrite text-center font-semibold py-6">
              {title}
            </h3>
            <Form onSubmit={handleStartVerification} className="flex mx-auto items-center flex-col gap-4 w-4/5 sm:w-2/3 md:w-3/4 lg:w-1/2">
              {inputList?.map((input, index) => (
                <div className="flex flex-col gap-1.5 w-full" key={index}>
                  <Label
                    htmlFor={input?.name}
                    className="text-sm md:text-base"
                  >
                    {input?.label}
                  </Label>
                  <Input
                    type={input?.type}
                    id={input?.name}
                    name={input?.name}
                    placeholder={input?.label}
                    value={data?.[input?.name] || ""}
                    onChange={handleDataChange}
                  />
                  {errorMsg?.[input.name] &&
                    <span className="text-red-700 text-xs md:text-sm">
                      {errorMsg[input.name]}
                    </span>
                  }
                </div>
              ))}
              <Button variant="secondary" className="cursor-pointer px-16" disabled={isLoading}>
                {isLoading && <Loader2 className="animate-spin" />}
                Create Now
              </Button>
            </Form>

            <div className="flex flex-col items-center text-center text-sm text-gray-400 space-y-2 mt-6">
              <p>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-white font-semibold hover:text-slate-300 hover:underline transition-colors"
                >
                  Login
                </Link>
              </p>
              {role === "seller"
                ? <p>
                  Want to register as a viewer?{" "}
                  <Link
                    href="/register"
                    className="text-white font-semibold hover:text-slate-300 hover:underline transition-colors"
                  >
                    Click here
                  </Link>
                </p>
                : <p>
                  Want to register as a seller?{" "}
                  <Link
                    href="/seller/register"
                    className="text-white font-semibold hover:text-slate-300 hover:underline transition-colors"
                  >
                    Click here
                  </Link>
                </p>
              }
            </div>

            <div className="my-6 flex items-center text-center gap-2 px-4">
              <hr className="border-gray-300 w-full" />
              <span className="text-sm text-gray-500">or</span>
              <hr className="border-gray-300 w-full" />
            </div>

            <ProvidersBox role={role} />
          </div>
        </>
      }
    </>
  )
}

export default register;