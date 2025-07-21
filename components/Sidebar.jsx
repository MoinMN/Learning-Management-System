"use client";

import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import { FaBookOpen, FaDollarSign } from "react-icons/fa";
import { useSidebarState } from "@/context/SidebarState";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { MdReportProblem } from "react-icons/md";
import { BsFillGridFill } from "react-icons/bs";
import { useUser } from "@/context/UserContext";
import { BsGearFill } from "react-icons/bs";
import { BiSupport } from "react-icons/bi";
import useIsMobile from "@/hooks/isMobile";
import { LuLogOut } from "react-icons/lu";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton"
import { usePathname } from "next/navigation";
import { signOutWithCleanup } from "@/utility/signout";

const labelsAdmin = [
  { name: "Dashboard", icon: BsFillGridFill, link: "/seller/dashboard" },
  { name: "My Courses", icon: FaBookOpen, link: "/seller/my-courses" },
  { name: "Earnings", icon: FaDollarSign, link: "/seller/earnings" },

  { name: "Setting", icon: BsGearFill, link: "/seller/setting/profile" },
  { name: "Report", icon: MdReportProblem, link: "/seller/report" },
  { name: "Support", icon: BiSupport, link: "/seller/support" },
];

const labelsSeller = [
  { name: "Dashboard", icon: BsFillGridFill, link: "/seller/dashboard" },
  { name: "My Courses", icon: FaBookOpen, link: "/seller/my-courses" },
  { name: "Earnings", icon: FaDollarSign, link: "/seller/earnings" },

  { name: "Setting", icon: BsGearFill, link: "/seller/setting/profile" },
  { name: "Report", icon: MdReportProblem, link: "/seller/report" },
  { name: "Support", icon: BiSupport, link: "/seller/support" },
];

const labelsViewer = [
  { name: "Dashboard", icon: BsFillGridFill, link: "/viewer/dashboard" },
  { name: "Courses", icon: FaBookOpen, link: "/viewer/courses" },
  { name: "My Courses", icon: FaDollarSign, link: "/viewer/my-courses" },

  { name: "Setting", icon: BsGearFill, link: "/viewer/setting/profile" },
  { name: "Report", icon: MdReportProblem, link: "/viewer/report" },
  { name: "Support", icon: BiSupport, link: "/viewer/support" },
];

const Sidebar = () => {
  const { user, loading, updateUser } = useUser();

  const pathname = usePathname();

  // context of sidebar state
  const { sidebarState, toggleSidebar } = useSidebarState();
  const isMobile = useIsMobile();

  const [labels, setLabels] = useState(null);
  const [active, setActive] = useState("Dashboard");

  useEffect(() => {
    if (loading) return;      // is still loading, do nothing
    if (user?.role === "ADMIN") setLabels(labelsAdmin);
    else if (user?.role === "SELLER") setLabels(labelsSeller);
    else setLabels(labelsViewer);
  }, [user, loading]);

  useEffect(() => {
    const fetchUser = async () => !user && await updateUser();
    fetchUser();
  }, []);

  useEffect(() => {
    if (!pathname) return;

    const segments = pathname.split('/').filter(Boolean); // avoid empty strings
    const secondPath = segments[1]; // "setting"

    const activeTab = secondPath.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    setActive(activeTab);
  }, [pathname]);

  if (loading && !isMobile) {
    return (
      <motion.aside
        className='bg-neutral-900 h-screen overflow-hidden flex flex-col z-50 sticky top-0 w-72'
      >
        {/* Loading skeleton */}
        <div className="p-6">
          <Skeleton className="h-10 w-10 rounded-full bg-zinc-800" />
        </div>

        <div className="flex flex-col gap-4 px-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md bg-zinc-800" />
          ))}
        </div>

        <div className="mt-auto p-4">
          <Skeleton className="h-14 w-full rounded-md bg-zinc-800" />
        </div>
      </motion.aside>
    );
  };

  return (
    <>
      <motion.aside
        initial={{
          width: isMobile ? 288 : (sidebarState === "open" ? 288 : sidebarState === 'minimized' ? 96 : 0),
          x: isMobile ? (sidebarState === "open" ? 0 : "-100%") : 0
        }}
        animate={
          isMobile
            ? { x: sidebarState === "open" ? 0 : "-100%" }
            : { width: sidebarState === "open" ? 288 : sidebarState === 'minimized' ? 96 : 0 }
        }
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`bg-neutral-900 text-white h-screen overflow-hidden flex flex-col z-50 ${isMobile ? 'fixed top-0 left-0 w-[288px]' : 'sticky top-0'
          }`}
      >
        {/* Logo and LMS text */}
        <div className={`flex ${isMobile ? "justify-center px-2" : "justify-between px-6"
          } items-center py-4`}>
          <div className="flex items-center gap-4 w-full">
            <div className={`${sidebarState === 'open' ? 'w-16 h-16' :
              sidebarState === 'minimized' ? 'w-12 h-12' : 'w-0 h-0'
              } transition-all duration-300`}>
              <Image
                src="/assets/logo.png"
                alt="Logo Image"
                width={64}
                height={64}
                className="rounded-full w-full h-full object-cover"
              />
            </div>
            {sidebarState === "open" && (
              <h3 className="font_montserrat text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-widest">
                LMS
              </h3>
            )}
          </div>
          {isMobile && (
            <TbLayoutSidebarLeftCollapse
              size={25}
              className="cursor-pointer"
              onClick={toggleSidebar}
            />
          )}
        </div>

        {/* main body */}
        <div className={`flex flex-col gap-2 text-sm md:text-base grow overflow-auto hide_scrollbar py-4 ${sidebarState === 'open' ? (isMobile ? "px-4" : "px-8") : "px-4"
          }`}>
          <SidebarContent
            labels={labels}
            sidebarState={sidebarState}
            active={active}
          />
        </div>

        {loading
          ? ""
          : user
            ? <div className="flex justify-around items-center bg-neutral-800 gap-2 p-2">
              <Link
                href={`${user?.role === "ADMIN" ? "/admin" :
                  user?.role === "SELLER" ? "/seller" : "/viewer"
                  }/setting/profile`}
                className="flex items-center gap-2"
              >
                <div className="relative h-12 w-12 rounded-full overflow-hidden">
                  <Image
                    src={user?.avatar}
                    alt="User's Avatar"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50px, 50px"
                  />
                </div>

                {sidebarState === 'open' && (
                  <div className="flex flex-col text-[10px] md:text-xs">
                    <h3 className="font-semibold">{user?.name}</h3>
                    <span className="text-gray-400">{user?.email}</span>
                  </div>
                )}
              </Link>

              {sidebarState === 'open' && (
                <LuLogOut
                  className="cursor-pointer text-red-500"
                  size={25}
                  onClick={() => signOutWithCleanup()}
                />
              )}
            </div>
            : <div className="flex flex-col items-center gap-2 w-full px-4 py-2">
              <Link
                href="/login"
                className="w-full text-center bg-white text-black rounded-md px-4 py-2 font-semibold transition-all duration-200 hover:bg-gray-200"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="w-full text-center border border-white text-white rounded-md px-4 py-2 font-semibold transition-all duration-200 hover:bg-white hover:text-black"
              >
                Sign Up
              </Link>
            </div>
        }
      </motion.aside>
    </>
  );
};

const SidebarContent = ({ labels, sidebarState, active }) => {
  return (
    <AnimatePresence>
      {labels?.map((label, index) => (
        <React.Fragment key={index}>
          {/* hr before 'Setting' */}
          {label.name === "Setting" && (
            <motion.hr
              layout
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-gray-600"
            />
          )}

          {/* sidebar item */}
          <Link href={label.link}>
            <motion.div
              key={label.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className={`flex items-center gap-4 cursor-pointer px-4 py-2 transition-all duration-200 ease-in-out rounded-md hover:bg-gray-500/20 ${active === label.name ? "bg-gray-500/20" : ""}`}
            >
              <label.icon size={20} className="text-white" />
              {sidebarState === 'open' && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-white"
                >
                  {label.name}
                </motion.span>
              )}
            </motion.div>
          </Link>
        </React.Fragment>
      ))
      }
    </AnimatePresence >
  )
}

export default Sidebar;
