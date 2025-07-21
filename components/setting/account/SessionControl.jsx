"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { signOutWithCleanup } from "@/utility/signout"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut } from "lucide-react";


const SessionControl = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const fetchSession = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/session/get', { method: "GET" });
      const result = await response.json();

      if (response.ok) {
        setSessions(result?.sessions);
        setCurrentSessionId(result?.current);
      }
    } catch (error) {
      console.log('Error while fetching sessions ', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Session & Device Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {[...Array(1)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-800 py-3"
            >
              {/* Session Info Block - Responsive */}
              <div className="space-y-2 w-full">
                <div className="flex items-center flex-wrap gap-1 sm:gap-2">
                  <Skeleton className="h-4 sm:h-5 w-20 sm:w-24 bg-gray-700 rounded-md" />
                  <Skeleton className="h-2 sm:h-3 w-2 sm:w-3 bg-gray-700 rounded-full" />
                  <Skeleton className="h-4 sm:h-5 w-16 sm:w-20 bg-gray-700 rounded-md" />
                </div>
                <div className="flex items-center flex-wrap gap-1 sm:gap-2">
                  <Skeleton className="h-3 sm:h-4 w-20 sm:w-28 bg-gray-700 rounded-md" />
                  <Skeleton className="h-2 sm:h-3 w-2 sm:w-3 bg-gray-700 rounded-full" />
                  <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-700 rounded-md" />
                </div>
              </div>

              {/* Current Session Badge Skeleton */}
              {i === 1 && (
                <Skeleton className="h-5 sm:h-6 w-20 sm:w-24 bg-gray-700 rounded-full mt-2 sm:mt-0" />
              )}
            </div>
          ))}

          {/* Sign Out Button Skeleton - Responsive */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-9 sm:h-10 w-full sm:w-64 bg-gray-700 rounded-md" />
          </div>
        </CardContent>
      </Card>
    )
  };

  return (
    <Card className="bg-gray-900 border border-gray-800 text-white">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Session & Device Control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions?.map((session) => (
          <div
            key={session?.id}
            className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-800 py-3 text-sm text-muted-foreground"
          >
            <div className="space-y-1 flex-1 min-w-0">
              <p className="font-medium text-white text-sm sm:text-base">
                {session?.browser || "Unknown Browser"}
                <span className="mx-1">•</span>
                {session?.os || "Unknown OS"}
              </p>
              <p className="text-xs sm:text-sm">
                {session?.device || "Unknown Device"}
                <span className="mx-1">•</span>
                {session?.location || "Unknown Location"}
              </p>
            </div>

            {currentSessionId === session?.id && (
              <span className="text-xs sm:text-sm text-green-500 font-semibold bg-green-900/30 px-3 py-1 rounded-full w-fit mt-1 sm:mt-0">
                Current Session
              </span>
            )}
          </div>
        ))}

        <div className="flex flex-col sm:flex-row">
          <Button
            onClick={() => signOutWithCleanup()}
            variant="destructive"
            className="text-xs sm:text-sm border-gray-700 cursor-pointer w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4" />
            Sign out from current device
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default SessionControl
