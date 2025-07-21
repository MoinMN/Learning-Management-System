"use client";

import { useSidebarState } from "@/context/SidebarState";
import LoadingAnimation from "@/components/SubLoader";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function ViewerLayout({ children }) {
  const { sidebarLoading } = useSidebarState();

  if (sidebarLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black">
        <LoadingAnimation />
      </div>
    );
  };

  return (
    <div className="flex bg-black min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
