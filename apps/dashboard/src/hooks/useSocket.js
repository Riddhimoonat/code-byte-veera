import { useEffect, useState } from "react";
import socket from "@/lib/socket";

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [newAlert, setNewAlert] = useState(null);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }
    function onSosNew(alert) {
      setNewAlert(alert);
    }

    socket.connect();
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("sos:new", onSosNew);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("sos:new", onSosNew);
      socket.disconnect();
    };
  }, []);

  return { isConnected, newAlert, setNewAlert };
};
