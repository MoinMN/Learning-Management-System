import RealTimeSessionMonitor from "@/components/RealTimeSessionMonitor";
import { SidebarStateProvider } from "@/context/SidebarState";
import { UserProvider } from "@/context/UserContext";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from 'sonner';
import "@/styles/global.css";

export const metadata = {
  title: "Learning Management System",
  description: "Learning Management System is platform where users can post there course, materials, etc and add dynamic price for each course, materials, etc. The platform takes 5% of cut from each subscriber.",
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font_opensans text-white" cz-shortcut-listen="true">
        <AuthProvider>
          <UserProvider>
            <SidebarStateProvider>
              {children}
              <RealTimeSessionMonitor />
            </SidebarStateProvider>
          </UserProvider>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
