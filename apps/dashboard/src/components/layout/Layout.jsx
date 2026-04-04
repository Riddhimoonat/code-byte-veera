import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import { useSocket } from "@/hooks/useSocket";
import { showSOSToast } from "../ui/SOSToast";

const Layout = ({ children }) => {
  const { isConnected, newAlert, setNewAlert } = useSocket();

  useEffect(() => {
    if (newAlert) {
      showSOSToast(newAlert);
      // Logic for refreshing dashboard when new alert comes can be handled by individual pages listening to socket or global state
      setNewAlert(null);
    }
  }, [newAlert, setNewAlert]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      <div className="flex-shrink-0">
        <Sidebar isConnected={isConnected} />
      </div>
      <main className="flex-1 ml-[64px] lg:ml-[240px] min-h-screen transition-all duration-300">
        <div className="p-6 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
