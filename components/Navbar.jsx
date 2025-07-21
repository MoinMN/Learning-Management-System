"use client";

import { TbLayoutSidebarRightCollapse } from "react-icons/tb";
import { useSidebarState } from "@/context/SidebarState";
import { FiBell } from "react-icons/fi";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const { sidebarState, toggleSidebar } = useSidebarState();
  const pathname = usePathname();

  const titleMap = {
    '/dashboard': "Dashboard",
    '/my-courses': "My Courses",
    '/earnings': "Earnings",
    '/setting': "Setting",
  };

  const basePath = pathname.split('/');
  const title = titleMap[`/${basePath[basePath.length - 1]}`] || "LMS";

  return (
    <nav className="bg-black text-white px-4 py-3 shadow flex items-center justify-between">
      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Menu Icon */}
        <motion.div
          animate={{ rotate: sidebarState === 'open' ? 180 : 0 }}
          transition={{ duration: 0.8 }}
        >
          <TbLayoutSidebarRightCollapse
            size={25}
            className="cursor-pointer"
            onClick={toggleSidebar}
          />
        </motion.div>
        <span className="font-semibold text-lg hidden sm:inline w-40 truncate">
          {title}
        </span>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 mx-4 max-w-md hidden md:block">
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-gray-800 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
        />
      </div>

      {/* Right: Notification Icon */}
      <div className="flex items-center gap-4">
        <button
          className="relative text-2xl hover:text-gray-400 transition"
          aria-label="Notifications"
        >
          <FiBell />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;