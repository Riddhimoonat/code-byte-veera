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
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
          <span className="p-2 bg-accent_amber/20 rounded-xl"><MapPin className="h-6 w-6 text-accent_amber" /></span>
          EVENT TELEMETRY
        </h1>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-1 ml-1">Live Global Incident Propagation Tracking</p>
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
        <div className="lg:col-span-8 bg-[#111111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 bg-white/[0.01]">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Chronological Signal Flow</h3>
          </div>
          <Table>
            <TableHeader className="bg-black/20">
              <TableRow className="border-white/5">
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-zinc-600 pl-8 h-12">Signal ID</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-zinc-600 h-12">GPS Matrix</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-zinc-600 h-12 text-center">Hour</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-zinc-600 h-12 text-right pr-8">Link</TableHead>
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
                    <TableCell className="pl-8 py-4">
                      <p className="text-[11px] font-black font-mono text-zinc-400 group-hover:text-white transition-colors">{alert._id.slice(-10).toUpperCase()}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-[11px] font-bold text-zinc-500 font-mono tracking-tighter">{alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}</p>
                    </TableCell>
                    <TableCell className="text-center font-black text-[11px] text-accent_amber">
                      {alert.hour}:00
                    </TableCell>
                    <TableCell className="text-right pr-8">
                       <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-accent_amber/10 hover:text-accent_amber transition-all rounded-lg" asChild>
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
          <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl shadow-2xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Temporal Distribution</h3>
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

            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-accent_red/30 transition-colors">
                  <Shield className="h-5 w-5 text-zinc-600 group-hover:text-accent_red transition-colors" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-white tracking-widest uppercase mb-1">Regional Watchpoint</p>
                   <p className="text-[11px] text-zinc-600 font-bold tracking-tight">Active surveillance node 12B enabled.</p>
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
