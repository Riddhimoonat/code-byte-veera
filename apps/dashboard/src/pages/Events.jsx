import React from "react";
import { useStats } from "@/hooks/useStats";
import { useAlerts } from "@/hooks/useAlerts";
import KPICard from "@/components/ui/KPICard";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { Activity, Clock, MapPin, ExternalLink, Shield, BarChart2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const Events = () => {
  const { stats, loading: statsLoading } = useStats();
  const { alerts, loading: alertsLoading } = useAlerts(1, 20);

  const peakHour = stats?.hourlyDistribution?.reduce((prev, curr) => (prev.count > curr.count) ? prev : curr, { _id: 0, count: 0 });
  const latestAlert = alerts.length > 0 ? alerts[0] : null;

  return (
    <div className="space-y-10 py-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <header>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent_amber/10 rounded-lg">
              <MapPin className="h-5 w-5 text-accent_amber" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Event Telemetry</h1>
              <p className="text-[13px] font-medium text-zinc-400 mt-0.5">Live Global Incident Propagation Tracking</p>
            </div>
          </div>
      </header>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
          title="Total Events Logged" 
          value={stats?.total || 0} 
          icon={Activity} 
          accentColor="#E8453C" 
        />
        <KPICard 
          title="Most Active Window" 
          value={peakHour?._id !== undefined ? `${peakHour._id}:00` : "--:--"} 
          icon={BarChart2} 
          accentColor="#F5A623" 
        />
        <KPICard 
          title="Last Signal Latency" 
          value={latestAlert ? formatDistanceToNow(new Date(latestAlert.createdAt)) : "N/A"} 
          icon={Clock} 
          accentColor="#2ECC71" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Table Section */}
        <div className="lg:col-span-8 bg-[#111111] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
          <div className="p-5 border-b border-white/5 bg-[#141414]">
            <h3 className="text-[13px] font-semibold text-zinc-200">Chronological Signal Flow</h3>
          </div>
          <Table>
            <TableHeader className="bg-black/20">
              <TableRow className="border-white/5">
                <TableHead className="font-medium text-[12px] text-zinc-400 pl-6 h-10">Signal ID</TableHead>
                <TableHead className="font-medium text-[12px] text-zinc-400 h-10">Location Coordinates</TableHead>
                <TableHead className="font-medium text-[12px] text-zinc-400 h-10 text-center">Time (Hour)</TableHead>
                <TableHead className="font-medium text-[12px] text-zinc-400 h-10 text-right pr-6">External</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alertsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5 h-16"><TableCell colSpan={4} className="animate-pulse bg-white/5" /></TableRow>
                ))
              ) : (
                alerts.map((alert) => (
                  <TableRow key={alert._id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <TableCell className="pl-6 py-3">
                      <p className="text-[13px] font-medium font-mono text-zinc-300 group-hover:text-white transition-colors">{alert._id.slice(-10).toUpperCase()}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-[13px] text-zinc-400 font-mono">{alert.latitude.toFixed(5)}, {alert.longitude.toFixed(5)}</p>
                    </TableCell>
                    <TableCell className="text-center font-medium text-[13px] text-accent_amber">
                      {alert.hour}:00
                    </TableCell>
                    <TableCell className="text-right pr-6">
                       <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:bg-white/10 hover:text-white transition-all rounded-md" asChild>
                         <a href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`} target="_blank" rel="noreferrer">
                           <ExternalLink className="h-4 w-4" />
                         </a>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Chart Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#111111] border border-white/5 p-5 rounded-2xl shadow-lg h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[13px] font-semibold text-zinc-200">Temporal Distribution</h3>
              <div className="h-2 w-2 rounded-full bg-accent_red pulse-red" />
            </div>
            
            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.hourlyDistribution || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="_id" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#525252', fontSize: 10, fontWeight: 900 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#525252', fontSize: 10, fontWeight: 900 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#E8453C' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {(stats?.hourlyDistribution || []).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.count === peakHour?.count ? '#E8453C' : '#262626'} 
                        className="transition-all duration-500 hover:opacity-80"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="h-9 w-9 bg-white/5 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10">
                  <Shield className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                </div>
                <div>
                   <p className="text-[13px] font-medium text-zinc-200">Regional Watchpoint</p>
                   <p className="text-[11px] text-zinc-500 mt-0.5">Active surveillance node 12B enabled.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
