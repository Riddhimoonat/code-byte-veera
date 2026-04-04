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
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
          <span className="p-2 bg-accent_red/20 rounded-xl"><LineIcon className="h-6 w-6 text-accent_red" /></span>
          INTELLIGENCE ANALYTICS
        </h1>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-1 ml-1">Deep Signal Pattern Recognition</p>
      </header>

      {/* Hourly Density Full Width */}
      <div className="bg-[#111111] border border-white/5 p-8 rounded-3xl shadow-2xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-10 w-32 h-32 bg-accent_red/5 blur-[50px] rounded-full pointer-events-none" />
        <div className="flex items-center justify-between">
           <div className="space-y-1">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Temporal Signal Density</h3>
             <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Incident Volume per 24h Cycle</p>
           </div>
           <div className="flex items-center gap-2">
             <div className="px-3 py-1 bg-accent_red text-[10px] text-white font-black uppercase tracking-widest rounded-md">Live Data</div>
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
        <div className="bg-[#111111] border border-white/5 p-8 rounded-3xl shadow-2xl h-[400px] flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="h-4 w-4 text-accent_green" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Cumulative Load Growth</h3>
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
        <div className="bg-[#111111] border border-white/5 p-8 rounded-3xl shadow-2xl h-[400px] flex flex-col">
           <div className="flex items-center gap-3 mb-8">
            <PieIcon className="h-4 w-4 text-accent_amber" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Daily Phase Distribution</h3>
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
      <div className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-white/[0.01]">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">High-Frequence Intervals</h3>
        </div>
        <Table>
          <TableHeader className="bg-black/10">
            <TableRow className="border-white/5">
              <TableHead className="font-bold text-[10px] uppercase tracking-widest text-zinc-600 pl-10 h-14">Rank</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest text-zinc-600 h-14">Time Interval</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest text-zinc-600 h-14 text-center">Peak Signals</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest text-zinc-600 h-14 text-right pr-10">Relative Impact</TableHead>
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
                    <TableCell className="pl-10 py-5">
                       <span className="text-xs font-black text-accent_red/60 group-hover:text-accent_red transition-colors">0{i+1}</span>
                    </TableCell>
                    <TableCell>
                       <p className="text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">{h._id > 12 ? `${h._id-12} PM` : `${h._id} AM`} to {h._id >= 23 ? '12 AM' : `${h._id+1 > 12 ? h._id+1-12 : h._id+1}${h._id+1 >= 12 ? ' PM' : ' AM'}`}</p>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                         <Activity className="h-3 w-3 text-accent_red" />
                         <span className="text-xs font-bold text-white">{h.count}</span>
                       </div>
                    </TableCell>
                    <TableCell className="pr-10 text-right">
                       <div className="w-32 h-1.5 bg-black/40 rounded-full inline-block overflow-hidden relative border border-white/5">
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
