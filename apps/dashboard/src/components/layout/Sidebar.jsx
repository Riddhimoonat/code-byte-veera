import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Bell, 
  MapPin, 
  BarChart2, 
  Settings, 
  LogOut, 
  Shield, 
  ChevronLeft, 
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Alerts", icon: Bell, path: "/alerts", showLiveDot: true },
  { label: "Events", icon: MapPin, path: "/events" },
  { label: "Analytics", icon: BarChart2, path: "/analytics" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

const Sidebar = ({ isConnected }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const onLogout = () => {
    localStorage.removeItem("veera_token");
    window.location.href = "/login";
  };

  return (
    <aside className={cn(
      "bg-[#0D0D0D] border-r border-white/5 h-screen transition-all duration-300 flex flex-col fixed top-0 left-0 z-50",
      collapsed ? "w-[64px]" : "w-[240px]"
    )}>
      {/* logo */}
      <div className="p-4 flex items-center justify-between mb-4">
        {!collapsed && (
          <div className="flex items-center gap-2 pl-2">
            <Shield className="h-6 w-6 text-accent_red" />
            <span className="font-bold text-lg tracking-tight">Veera <span className="text-accent_red">Admin</span></span>
          </div>
        )}
        {collapsed && <Shield className="h-6 w-6 text-accent_red mx-auto" />}
      </div>

      {/* nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative group",
              isActive 
                ? "bg-accent_red/10 text-white border-l-2 border-accent_red" 
                : "text-zinc-500 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className="h-5 w-5" />
            {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
            {item.showLiveDot && isConnected && (
              <div className="absolute right-3 h-2 w-2 rounded-full pulse-red" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* bottom */}
      <div className="p-3 border-t border-white/5 space-y-1">
        <div className="px-3 py-2 flex items-center justify-between">
           {!collapsed && (
            <div className="flex items-center gap-2">
              <div className={cn("h-2 w-2 rounded-full", isConnected ? "bg-accent_green pulse-green shadow-[0_0_8px_rgba(46,204,113,0.5)]" : "bg-zinc-500")} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {isConnected ? "Live Engine" : "Offline"}
              </span>
            </div>
           )}
           {collapsed && <div className={cn("h-2 w-2 rounded-full mx-auto", isConnected ? "bg-accent_green pulse-green shadow-[0_0_8px_rgba(46,204,113,0.5)]" : "bg-zinc-500")} />}
        </div>
        
        <Button 
          variant="ghost" 
          onClick={onLogout}
          className={cn(
            "w-full flex items-center gap-3 justify-start text-zinc-500 hover:text-red-500 hover:bg-red-500/10 h-10",
            collapsed ? "px-2" : "px-3"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="font-medium text-sm">Logout</span>}
        </Button>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-10 h-6 w-6 bg-accent_red rounded-full border-4 border-[#0A0A0A] flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
};

export default Sidebar;
