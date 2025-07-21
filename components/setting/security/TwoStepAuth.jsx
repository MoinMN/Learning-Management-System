'use client';

import { Switch } from "@/components/ui/switch";
import { useUser } from "@/context/UserContext";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import LoadingAnimation from "@/components/SubLoader";
import Heading from "../Heading";

const TwoStepAuth = () => {
  const router = useRouter();

  const { user, loading, updateUser } = useUser();

  const [isEnabled, setIsEnabled] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (val) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/user/two-step-auth', { method: "PATCH" });
      const result = await response.json();
      if (response.ok) {
        await updateUser();
        if (result?.isTwoStepAuthOn) {
          toast.success("Two-Step Authentication Enabled!");
        } else {
          toast.warning("Two-Step Authentication Disabled!");
        }
      } else {
        toast.error(result?.message);
      }
      setIsEnabled(val);
    } catch (error) {
      console.error("Error updating 2FA:", error);
      toast.error(error?.message || "Internal Server Error, Try Again Later!");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    setIsEnabled(user?.isTwoStepAuthOn);
  }, [loading]);

  if (loading) return <LoadingAnimation />;

  return (
    <div className="w-full px-2 py-2 md:px-4 space-y-6">
      <BackButton handleOnClick={() => router.back()} />
      {/* Header */}
      <Heading title="Two-Step Authentication" />

      <p className="text-muted-foreground text-sm px-0 md:px-4">
        Enable this option to add an extra layer of security to your account. A verification email will be required each time you log in.
      </p>

      {/* Switch */}
      <div className="max-w-2xl mx-auto border-t border-zinc-800 pt-6">
        <div className="flex items-center justify-between py-3 border-b border-zinc-800">
          <span className="text-sm text-gray-300">Enable Two-Step Authentication</span>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={isUpdating}
            className={`data-[state=checked]:bg-green-500 bg-zinc-700 border border-zinc-600 
              relative inline-flex h-6 w-9 items-center rounded-full transition-colors cursor-pointer`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform 
                ${isEnabled ? 'translate-x-5' : 'translate-x-1'}`}
            />
          </Switch>
        </div>
        {isUpdating && (
          <div className="text-xs text-muted-foreground mt-2 flex justify-end items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Updating setting...
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoStepAuth;
