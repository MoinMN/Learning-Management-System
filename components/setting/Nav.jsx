'use client';

import { FiUser, FiLock, FiSettings } from "react-icons/fi";
import { MdEditNotifications } from "react-icons/md";
import { useUser } from "@/context/UserContext";
import { usePathname } from "next/navigation";
import { FaRupeeSign } from "react-icons/fa";
import { FaHistory } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

const viewerNavItems = [
  { name: "Profile", icon: <FiUser />, link: "/profile" },
  { name: "Payment History", icon: <FaHistory />, link: "/payment-history" },
  { name: "Notifications", icon: <MdEditNotifications />, link: "/notifications" },
  { name: "Security", icon: <FiLock />, link: "/security" },
  { name: "Account", icon: <FiSettings />, link: "/account" },
];
const sellerNavItems = [
  { name: "Profile", icon: <FiUser />, link: "/profile" },
  { name: "Connect Wallet", icon: <FaRupeeSign />, link: "/connect-wallet" },
  { name: "Notifications", icon: <MdEditNotifications />, link: "/notifications" },
  { name: "Security", icon: <FiLock />, link: "/security" },
  { name: "Account", icon: <FiSettings />, link: "/account" },
];
const adminNavItems = [
  { name: "Profile", icon: <FiUser />, link: "/profile" },
  { name: "Security", icon: <FiLock />, link: "/security" },
  { name: "Account", icon: <FiSettings />, link: "/account" },
];

const SettingNav = () => {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const containerRef = useRef(null);
  const [visibleItems, setVisibleItems] = useState(5); // Default to all items
  const [navItems, setNavItems] = useState(null);
  const [active, setActive] = useState("Profile");

  const basePath = (() => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length >= 2) {
      return `/${segments[0]}/${segments[1]}`;
    }
    return '/';
  })();

  useEffect(() => {
    if (!pathname) return;

    const segments = pathname.split('/').filter(Boolean);
    const tabSegment = segments[2] || "profile";
    const activeTab = tabSegment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    setActive(activeTab);
  }, [pathname]);

  useEffect(() => {
    if (loading) return;
    if (user?.role === "ADMIN") setNavItems(adminNavItems);
    else if (user?.role === "SELLER") setNavItems(sellerNavItems);
    else setNavItems(viewerNavItems);
  }, [user]);

  useEffect(() => {
    const calculateVisibleItems = () => {
      if (!containerRef.current || !navItems) return;

      const container = containerRef.current;
      const containerWidth = container.offsetWidth;
      const children = Array.from(container.children);

      // Account for dropdown button width (approx 48px + margins)
      const dropdownWidth = 48 + 16;
      let availableWidth = containerWidth - dropdownWidth;
      let visibleCount = 0;
      let totalWidth = 0;

      children.forEach((child, index) => {
        if (child.clientWidth > 0 && index < navItems.length) {
          totalWidth += child.clientWidth + 16; // 16px for gap
          if (totalWidth <= availableWidth) {
            visibleCount++;
          }
        }
      });

      setVisibleItems(Math.max(1, visibleCount));
    };

    calculateVisibleItems();
    window.addEventListener('resize', calculateVisibleItems);
    return () => window.removeEventListener('resize', calculateVisibleItems);
  }, [navItems]);

  const visibleNavItems = navItems?.slice(0, visibleItems) || [];
  const hiddenNavItems = navItems?.slice(visibleItems) || [];

  return (
    <>
      {/* Mobile - Horizontal with dropdown */}
      <div className="md:hidden w-full border-b py-2 px-2 sticky top-0 z-10 backdrop-blur-lg">
        <div className="flex flex-wrap items-center justify-between gap-2" ref={containerRef}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-20 rounded-lg mr-4 bg-zinc-800" />
            ))
          ) : (
            <>
              {visibleNavItems.map((item) => (
                <Button
                  key={item.name}
                  asChild
                  variant={active === item.name ? "secondary" : "ghost"}
                  className="shrink-0 w-28 h-14"
                >
                  <Link
                    href={`${basePath}${item.link}`}
                    onClick={() => setActive(item.name)}
                    className="flex flex-col gap-1 items-center justify-center text-wrap"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-xs">{item.name}</span>
                  </Link>
                </Button>
              ))}

              {hiddenNavItems?.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0 cursor-pointer">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-[#1e1e1e] border border-gray-700 text-white"
                  >
                    {hiddenNavItems?.map((item) => (
                      <DropdownMenuItem
                        key={item.name}
                        asChild
                        className="focus:bg-gray-700 focus:text-white cursor-pointer"
                      >
                        <Link
                          href={`${basePath}${item.link}`}
                          onClick={() => setActive(item.name)}
                          className="flex items-center gap-2 w-full"
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span>{item.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>
      </div>

      {/* Desktop - Vertical (unchanged) */}
      <ScrollArea className="hidden md:block min-h-[85vh] w-60 border-r p-4 sticky top-0 z-10">
        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg bg-zinc-800" />
            ))
          ) : (
            navItems?.map((item) => (
              <Button
                key={item.name}
                asChild
                variant={active === item.name ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Link
                  href={`${basePath}${item.link}`}
                  onClick={() => setActive(item.name)}
                  className="flex items-center gap-3"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </Button>
            ))
          )}
        </div>
      </ScrollArea>
    </>
  );
};

export default SettingNav;