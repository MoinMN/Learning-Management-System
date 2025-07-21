"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch'
import { useUser } from '@/context/UserContext';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const AccountPreference = () => {
  const { user, loading } = useUser();

  const [emailPublic, setEmailPublic] = useState(false);

  const handleToggleShowEmailPublicly = async () => {
    try {
      const response = await fetch('/api/user/show-email-publicly', { method: "PATCH" });
      const result = await response.json();

      if (response.ok) {
        setEmailPublic(result?.showEmailPublicly);
      } else {
        toast.error(result?.message || "Try Again Later!");
      }
    } catch (error) {
      console.log('Error toggling show email publicly ', error);
      toast.error("Try Again Try!");
    }
  };

  useEffect(() => {
    if (loading) return;
    setEmailPublic(user?.showEmailPublicly);
  }, [loading]);

  if (loading) {
    return (
      <Card className="bg-gray-900 border border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg md:text-xl">
            Account Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Email Preference Skeleton - Responsive */}
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 xs:gap-4">
            <div className="space-y-1 xs:space-y-2">
              <Label className="block">
                <Skeleton className="h-4 xs:h-5 w-24 xs:w-32 bg-gray-700 rounded-md" />
              </Label>
              <Skeleton className="h-3 xs:h-4 w-40 xs:w-56 bg-gray-700 rounded-md" />
            </div>
            <Skeleton className="h-5 xs:h-6 w-9 xs:w-11 bg-gray-700 rounded-full self-end xs:self-auto" />
          </div>
        </CardContent>
      </Card>
    )
  };

  return (
    <Card className="bg-gray-900 border border-gray-800 text-white">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">
          Account Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <Label className="text-sm sm:text-base">
              Email Display
            </Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Show your email publicly on your profile.
            </p>
          </div>
          <div className="">
            <Switch
              checked={emailPublic}
              onCheckedChange={handleToggleShowEmailPublicly}
              className="data-[state=checked]:bg-green-500 bg-zinc-700 border border-zinc-600 cursor-pointer"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AccountPreference
