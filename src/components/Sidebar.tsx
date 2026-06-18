import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Grid3X3,
  BookMarked,
  User,
  Settings,
  Info,
  LogOut,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const navItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Grid3X3, label: "Category", path: "/category" },
  { icon: BookMarked, label: "Library", path: "/library" },
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: Info, label: "About Us", path: "/about" },
];

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 w-full h-16 lg:h-screen lg:w-64 bg-sidebar border-b lg:border-b-0 lg:border-r border-sidebar-border flex flex-row lg:flex-col z-50">
      {/* Logo */}
      <div className="p-3 lg:p-6 border-r lg:border-r-0 lg:border-b border-sidebar-border flex items-center shrink-0">
        <Link to="/home" className="flex items-center gap-2 lg:gap-3">
          <BookOpen className="w-6 h-6 lg:w-8 lg:h-8 text-accent shrink-0" />
          <span className="font-serif text-lg lg:text-xl font-bold text-sidebar-foreground hidden sm:block">
            LITVISION
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-row lg:flex-col items-center lg:items-stretch px-2 lg:px-4 py-0 lg:py-4 gap-1 lg:gap-2 overflow-x-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 lg:py-3 rounded-lg transition-all duration-200 shrink-0",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 lg:p-4 border-l lg:border-l-0 lg:border-t border-sidebar-border flex items-center shrink-0">
        <button
          onClick={handleLogout}
          className="flex flex-row items-center justify-center gap-3 px-3 py-2.5 lg:py-3 w-full rounded-lg text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          title="Logout"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="hidden lg:block">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
