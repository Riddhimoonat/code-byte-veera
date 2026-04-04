import React, { useMemo } from "react";
import { useStats } from "@/hooks/useStats";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Shield, BarChart2, PieChart as PieIcon, LineChart as LineIcon, TrendingUp } from "lucide-react";

const COLORS = ['#E8453C', '#F5A623', '#2ECC71', '#3498DB'];

const Analytics = () => {
  const { stats, loading } = useStats();

  const timeOfDayData = useMemo(() => {
    if (!stats?.hourlyDistribution) return [];
    const morning = stats.hourlyDistribution.filter(h => h._id >= 6 && h._id < 12).reduce((a, b) => a + b.count, 0);
    const afternoon = stats.hourlyDistribution.filter(h => h._id >= 12 && h._id < 18).reduce((a, b) => a + b.count, 0);
    const evening = stats.hourlyDistribution.filter(h => h._id >= 18 && h._id < 24).reduce((a, b) => a + b.count, 0);
    const night = stats.hourlyDistribution.filter(h => h._id >= 0 && h._id < 6).reduce((a, b) => a + b.count, 0);
    return [
      { name: 'MORNING', value: morning },
      { name: 'AFTERNOON', value: afternoon },
      { name: 'EVENING', value: evening },
      { name: 'NIGHT', value: night }
    ].filter(v => v.value > 0);
  }, [stats]);

  const topHours = useMemo(() => {
    if (!stats?.hourlyDistribution) return [];
    return [...stats.hourlyDistribution].sort((a,b) => b.count - a.count).slice(0, 5);
  }, [stats]);

  const cumulativeData = useMemo(() => {
    if (!stats?.hourlyDistribution) return [];
    let cumulative = 0;
    return [...stats.hourlyDistribution].sort((a,b) => a._id - b._id).map(h => {
      cumulative += h.count;
      return { hour: h._id, total: cumulative };
    });
  }, [stats]);

  return (
    <div className="space-y-10 py-4 animate-in fade-in duration-500">
      <header>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent_red/10 rounded-lg">
            <LineIcon className="h-5 w-5 text-accent_red" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Intelligence Analytics</h1>
            <p className="text-[13px] font-medium text-zinc-400 mt-0.5">Deep Signal Pattern Recognition</p>
          </div>
        </div>
      </header>

      {/* Hourly Density Full Width */}
      <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl shadow-lg space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-10 w-32 h-32 bg-accent_red/5 blur-[50px] rounded-full pointer-events-none" />
        <div className="flex items-center justify-between">
           <div className="space-y-1">
             <h3 className="text-[14px] font-semibold text-white">Temporal Signal Density</h3>
             <p className="text-[12px] text-zinc-400">Incident Volume per 24h Cycle</p>
           </div>
           <div className="flex items-center gap-2">
             <div className="px-2 py-1 bg-accent_red/10 text-accent_red border border-accent_red/20 text-[11px] font-medium rounded-md">Live Data</div>
           </div>
        </div>
        <div className="h-[300px] w-full">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={stats?.hourlyDistribution || []} margin={{ left: -20 }}>
               <XAxis 
                  dataKey="_id" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#333', fontSize: 11, fontWeight: 900 }}
                  label={{ value: 'HOUR', position: 'bottom', fill: '#333', fontSize: 10, fontWeight: 900 }}
               />
               <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#333', fontSize: 11, fontWeight: 900 }}
               />
               <Tooltip 
                  cursor={{ fill: 'white', opacity: 0.05 }}
                  contentStyle={{ background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
               />
               <Bar dataKey="count" fill="#E8453C" radius={[6, 6, 0, 0]} className="hover:opacity-80 transition-opacity" />
             </BarChart>
           </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cumulative Flow */}
        <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl shadow-lg h-[400px] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-4 w-4 text-accent_green" />
            <h3 className="text-[13px] font-semibold text-zinc-200">Cumulative Load Growth</h3>
          </div>
          <div className="flex-1 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={cumulativeData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                 <XAxis dataKey="hour" hide />
                 <Tooltip 
                    contentStyle={{ background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '12px' }}
                 />
                 <Line type="monotone" dataKey="total" stroke="#2ECC71" strokeWidth={3} dot={false} animationDuration={2000} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Phase Distribution */}
        <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl shadow-lg h-[400px] flex flex-col">
           <div className="flex items-center gap-2 mb-6">
            <PieIcon className="h-4 w-4 text-accent_amber" />
            <h3 className="text-[13px] font-semibold text-zinc-200">Daily Phase Distribution</h3>
          </div>
          <div className="flex-1 w-full flex flex-col relative">
             <div className="flex-1 w-full relative h-full"> 
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                      data={timeOfDayData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      animationBegin={500}
                      animationDuration={1500}
                   >
                     {timeOfDayData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip contentStyle={{ background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '12px' }} />
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em]">Signal Share</p>
                  <div className="h-1 w-4 bg-accent_amber mt-1" />
               </div>
             </div>
             
             <div className="mt-4 flex flex-wrap justify-center gap-4">
                {timeOfDayData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{d.name}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Top Hours Table */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-5 border-b border-white/5 bg-[#141414]">
          <h3 className="text-[13px] font-semibold text-zinc-200">High-Frequency Intervals</h3>
        </div>
        <Table>
          <TableHeader className="bg-black/10">
            <TableRow className="border-white/5">
              <TableHead className="font-medium text-[12px] text-zinc-400 pl-6 h-10">Rank</TableHead>
              <TableHead className="font-medium text-[12px] text-zinc-400 h-10">Time Interval</TableHead>
              <TableHead className="font-medium text-[12px] text-zinc-400 h-10 text-center">Peak Signals</TableHead>
              <TableHead className="font-medium text-[12px] text-zinc-400 h-10 text-right pr-6">Relative Impact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5 h-16"><TableCell colSpan={4} className="animate-pulse bg-white/5" /></TableRow>
                ))
             ) : (
                topHours.map((h, i) => (
                  <TableRow key={h._id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <TableCell className="pl-6 py-4">
                       <span className="text-[13px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">0{i+1}</span>
                    </TableCell>
                    <TableCell>
                       <p className="text-[13px] text-zinc-300 group-hover:text-white transition-colors">{h._id > 12 ? `${h._id-12} PM` : `${h._id} AM`} to {h._id >= 23 ? '12 AM' : `${h._id+1 > 12 ? h._id+1-12 : h._id+1}${h._id+1 >= 12 ? ' PM' : ' AM'}`}</p>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1 rounded-md border border-white/5">
                         <Activity className="h-3 w-3 text-accent_red" />
                         <span className="text-[12px] font-medium text-white">{h.count}</span>
                       </div>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                       <div className="w-24 h-1.5 bg-black/40 rounded-full inline-block overflow-hidden relative border border-white/10">
                          <div 
                            className="absolute top-0 left-0 h-full bg-accent_red rounded-full" 
                            style={{ width: `${(h.count / (topHours[0]?.count || 1)) * 100}%` }}
                          />
                       </div>
                    </TableCell>
                  </TableRow>
                ))
             )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Analytics;
