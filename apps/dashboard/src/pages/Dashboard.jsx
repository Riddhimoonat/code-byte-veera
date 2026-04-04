import React, { useEffect, useState } from "react";
import { useStats } from "@/hooks/useStats";
import { useAlerts } from "@/hooks/useAlerts";
import { useSocket } from "@/hooks/useSocket";
import KPICard from "@/components/ui/KPICard";
import LiveMap from "@/components/ui/LiveMap";
import HeatmapGrid from "@/components/ui/HeatmapGrid";
import { Activity, Bell, Database, Wifi, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { stats, loading: statsLoading } = useStats();
  const { alerts, loading: alertsLoading, addAlert } = useAlerts(1, 10);
  const { isConnected, newAlert } = useSocket();
  const [heatmapData, setHeatmapData] = useState([]);
  const [hmLoading, setHmLoading] = useState(false);

  useEffect(() => {
    if (newAlert) {
      addAlert(newAlert);
    }
  }, [newAlert, addAlert]);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        setHmLoading(true);
        const res = await api.post('/api/risk-score/map', {
          latitude: 23.2599,
          longitude: 77.4126,
          timestamp: new Date().toISOString()
        });
        setHeatmapData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setHmLoading(false);
      }
    };
    fetchHeatmap();
  }, []);

  const peakHour = stats?.hourlyDistribution?.reduce((prev, curr) => (prev.count > curr.count) ? prev : curr, { _id: 0, count: 0 });

  return (
    <div className="space-y-10 py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">MISSION <span className="text-accent_red not-italic">CONTROL</span></h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-1 w-8 bg-accent_red" />
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] italic">Live Intelligence Operational Terminal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="border-white/5 bg-white/5 hover:bg-white/10 text-white font-black tracking-widest text-[11px] h-12 px-8 uppercase shadow-2xl">
            EXPORT DATABASE
          </Button>
          <div className="h-12 px-5 bg-[#111111] border border-white/5 rounded-xl flex items-center gap-3 backdrop-blur-md shadow-xl">
            <div className={cn("h-2.5 w-2.5 rounded-full", isConnected ? "bg-accent_green pulse-green" : "bg-zinc-600")} />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {isConnected ? "Neural Link Active" : "Link Severed"}
            </span>
          </div>
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Active Emergencies" 
          value={stats?.total || 0} 
          icon={Activity} 
          accentColor="#E8453C" 
          pulse="red"
          className="shadow-[0_8px_30px_rgba(232,69,60,0.1)]"
        />
        <KPICard 
          title="Critical Peak Hour" 
          value={peakHour?._id !== undefined ? (peakHour._id > 12 ? `${peakHour._id - 12} PM` : `${peakHour._id} AM`) : "--:--"} 
          icon={Clock} 
          accentColor="#F5A623" 
        />
        <KPICard 
          title="Total Data Points" 
          value={stats?.total || 0} 
          icon={Database} 
          accentColor="#FFFFFF" 
        />
        <KPICard 
          title="Telemetry Status" 
          value={isConnected ? "STABLE" : "ERROR"} 
          icon={Wifi} 
          accentColor="#2ECC71" 
          pulse={isConnected ? "green" : "red"}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
           <div className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden flex flex-col h-[560px] shadow-2xl">
             <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-accent_red/10 rounded-lg">
                   <Bell className="h-4 w-4 text-accent_red" />
                 </div>
                 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Live Incident Feed</h3>
               </div>
               <div className="flex items-center gap-4">
                 <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Auto-refreshing</span>
                 <div className="h-1 w-1 bg-zinc-600 rounded-full" />
               </div>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
               {alertsLoading ? (
                 <div className="p-4 space-y-4">
                   {Array.from({ length: 6 }).map((_, i) => (
                     <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                   ))}
                 </div>
               ) : (
                 <div className="space-y-2">
                   {alerts.length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center opacity-30 mt-20">
                       <Shield className="h-16 w-16 mb-4" />
                       <p className="text-xs font-black uppercase tracking-[0.3em]">No Active Incidents</p>
                     </div>
                   )}
                   {alerts.map((alert) => (
                     <div key={alert._id} className="p-4 flex items-center justify-between group transition-all hover:bg-white/[0.03] rounded-2xl border border-transparent hover:border-white/5">
                       <div className="flex items-center gap-5">
                         <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-accent_red/30 transition-colors">
                           <MapPin className="h-5 w-5 text-zinc-500 group-hover:text-accent_red transition-colors" />
                         </div>
                         <div>
                           <p className="text-sm font-black text-white tracking-tight font-mono">
                             {alert.latitude.toFixed(5)}, {alert.longitude.toFixed(5)}
                           </p>
                           <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                             Triggered {formatDistanceToNow(new Date(alert.createdAt))} ago
                           </p>
                         </div>
                       </div>
                       <Button size="icon" variant="ghost" className="h-10 w-10 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl" onClick={() => window.location.href=`/alerts?id=${alert._id}`}>
                          <Eye className="h-5 w-5" />
                       </Button>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           </div>
        </div>

        <div className="lg:col-span-5 h-[560px] relative">
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
              <div className="h-1.5 w-1.5 bg-accent_red rounded-full animate-ping" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Global Watch</span>
            </div>
          </div>
          <LiveMap alerts={alerts} />
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Risk Distribution Topology</h3>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
        </div>
        <div className="bg-[#111111] border border-white/5 p-10 rounded-[2.5rem] flex flex-col items-center shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-accent_red/5 blur-[100px] rounded-full pointer-events-none" />
           <HeatmapGrid data={heatmapData} loading={hmLoading} />
           <div className="mt-10 flex flex-col items-center gap-2">
             <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">High-Density Predictive Matrix v4.2</p>
             <div className="flex items-center gap-1">
               <div className="h-1 w-1 bg-green-500 rounded-full" />
               <div className="h-1 w-1 bg-amber-500 rounded-full" />
               <div className="h-1 w-1 bg-red-500 rounded-full" />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
