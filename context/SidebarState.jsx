'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const SidebarStateContext = createContext();

export const SidebarStateProvider = ({ children }) => {
  const [sidebarState, setSidebarState] = useState("closed"); // "open" | "minimized" | "closed"
  const [sidebarLoading, setSidebarLoading] = useState(true); // Add loading state

  useEffect(() => {
    const saved = localStorage.getItem("sidebarState");

    // Set loading to false once we've checked localStorage
    const finishLoading = () => setSidebarLoading(false);

    if (saved === "open" || saved === "minimized" || saved === "closed") {
      setSidebarState(saved);
      finishLoading();
    }

    // Check initial window width
    if (window.innerWidth < 1024) {
      setSidebarState("closed");
      finishLoading();
    } else {
      setSidebarState("open");
      finishLoading();
    }

    // Fallback in case something goes wrong
    const timer = setTimeout(finishLoading, 300);
    return () => clearTimeout(timer);
  }, []);

  // Watch sidebarState and save to localStorage
  useEffect(() => {
    if (!sidebarLoading) { // Only save to localStorage after initial load
      localStorage.setItem("sidebarState", sidebarState);
    }
  }, [sidebarState, sidebarLoading]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarState("closed");
      } else {
        const saved = localStorage.getItem("sidebarState");
        if (saved && saved !== "closed") {
          setSidebarState(saved); // Restore if previously open/minimized
        } else {
          setSidebarState("open"); // Fallback
        }
      }
    };

    // Add listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle logic based on current state
  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      // On small devices: toggle between "closed" and "open"
      setSidebarState(prev => (prev === "closed" ? "open" : "closed"));
    } else {
      // On desktop: toggle between "open" and "minimized"
      setSidebarState(prev => prev === "open" ? "minimized" : "open");
    }
  };

  return (
    <SidebarStateContext.Provider value={{ sidebarState, setSidebarState, toggleSidebar, sidebarLoading }}>
      {children}
    </SidebarStateContext.Provider>
  );
}

export function useSidebarState() {
  return useContext(SidebarStateContext);
}