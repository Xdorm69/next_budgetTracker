import Navbar from "@/components/Navbar";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="relative flex h-screen w-full flex-col">
      <Navbar />
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
}
