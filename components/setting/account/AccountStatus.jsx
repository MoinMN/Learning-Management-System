"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useUser } from "@/context/UserContext"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"


const AccountStatus = () => {
  const { user, loading } = useUser();

  const [verificationRequest, setVerificationRequest] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestVerification = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/request-verification/update', { method: "PUT" });
      const result = await response.json();

      if (response.ok) {
        toast.success(result?.message);
        fetchRequestVerification();
      } else {
        toast.error(result?.message || "Try Again Later!");
      }
    } catch (error) {
      console.log('Error while requesting verification ', error);
      toast.error("Try Again Try!");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRequestVerification = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/request-verification/get', { method: "GET" });
      const result = await response.json();

      if (response.ok) {
        setVerificationRequest(result.verificationRequest);
      }
    } catch (error) {
      console.log('Error while fetching requesting verification ', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestVerification();
  }, []);

  if (loading) {
    return (
      <Card className="bg-gray-900 border border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Account Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Verification Status Skeleton - Responsive */}
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
            <div className="space-y-1">
              <Skeleton className="h-4 xs:h-5 w-24 xs:w-32 bg-gray-700 rounded-md" />
              <Skeleton className="h-3 xs:h-4 w-36 xs:w-48 bg-gray-700 rounded-md" />
            </div>
            <Skeleton className="h-8 xs:h-9 w-full xs:w-32 bg-gray-700 rounded-md mt-2 xs:mt-0" />
          </div>

          {/* Linked Provider Skeleton - Responsive */}
          <div className="space-y-1">
            <Skeleton className="h-4 xs:h-5 w-24 xs:w-32 bg-gray-700 rounded-md" />
            <Skeleton className="h-3 xs:h-4 w-20 xs:w-24 bg-gray-700 rounded-md" />
          </div>
        </CardContent>
      </Card>
    )
  };

  return (
    <Card className="bg-gray-900 border border-gray-800 text-white">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Account Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user?.role === "SELLER" &&
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Label className="text-sm sm:text-base">Verification Status</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {user?.isVerified ? "Your account is verified." : "Your account is not verified."}
              </p>
            </div>
            {verificationRequest
              ? verificationRequest?.status === "PENDING"
                ? <Button variant="secondary" disabled className="w-full sm:w-auto mt-2 sm:mt-0">Requested</Button>
                : verificationRequest?.status === "REJECTED"
                  ? <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <Button variant="destructive" disabled className="w-full sm:w-auto">Rejected</Button>
                    <Button
                      variant="secondary"
                      onClick={handleRequestVerification}
                      disabled={isLoading}
                      className="w-full sm:w-auto"
                    >
                      {isLoading
                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Requesting...</>
                        : "Request Again"
                      }
                    </Button>
                  </div>
                  : verificationRequest?.status === "APPROVED"
                    ? <Button variant="secondary" disabled className="w-full sm:w-auto mt-2 sm:mt-0">Verified</Button>
                    : null
              : <Button
                variant="secondary"
                onClick={handleRequestVerification}
                disabled={isLoading}
                className="w-full sm:w-auto mt-2 sm:mt-0"
              >
                {isLoading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Requesting...</>
                  : "Request Verification"
                }
              </Button>
            }
          </div>
        }

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Label className="text-sm sm:text-base">Linked Provider</Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {user?.provider.charAt(0).toUpperCase() + user?.provider.slice(1)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AccountStatus
