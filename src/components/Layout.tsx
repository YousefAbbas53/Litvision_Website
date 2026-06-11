import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-secondary w-full relative">
      <Sidebar />
      <main className="pt-16 lg:pt-0 pb-16 lg:pb-0 ml-0 lg:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;
