'use client';

import { useUser } from '@/context/UserContext';
import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

export default function RealTimeSessionMonitor() {
  const { user, loading } = useUser();

  const fetchSessionActive = async () => {
    try {
      const response = await fetch('/api/user/session/active', { method: "GET" });
      const result = await response.json();

      if (response.ok) {
        if (!result?.isActive) {
          signOut({ callbackUrl: "/login?message=another-device" });
        }
      }
    } catch (error) {
      console.log('Error while fetching session! ', error);
    }
  }

  useEffect(() => {
    if (loading) return;

    const interval = setInterval(async () => {
      if (user) fetchSessionActive();
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, [loading]);

  return null;
}