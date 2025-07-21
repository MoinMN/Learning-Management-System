import { signOut } from "next-auth/react";

export async function signOutWithCleanup() {
  try {
    // Hit your cleanup API
    await fetch("/api/auth/signout-cleanup", { method: "GET" });

    // Then sign out
    await signOut({ callbackUrl: "/login" });
  } catch (error) {
    console.error("Error during sign out:", error);
    // fallback signOut anyway
    await signOut({ callbackUrl: "/login" });
  }
}
