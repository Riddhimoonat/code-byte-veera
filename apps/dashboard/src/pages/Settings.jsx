import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Shield, AlertTriangle, Info, MapPin, ExternalLink, Phone, Database, Globe, Zap, Cpu } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Settings = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const res = await api.post('/api/risk-score/nearest-stations', {
          latitude: 23.2599,
          longitude: 77.4126
        });
        setStations(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  return (
    <div className="space-y-10 py-4 animate-in fade-in slide-in-from-right-4 duration-700 pb-20">
      <header>
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
          <span className="p-2 bg-accent_green/20 rounded-xl"><Info className="h-6 w-6 text-accent_green" /></span>
          SYSTEM CONFIGURATION
        </h1>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-1 ml-1">Central Console Security Parameters</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Thresholds */}
        <div className="space-y-6">
           <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-accent_red" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Risk Severity Protocol</h3>
           </div>
           <div className="grid grid-cols-1 gap-4">
              {[
                { range: '00 - 29', level: 'LOW', color: '#2ECC71', bg: 'bg-green-500/10' },
                { range: '30 - 64', level: 'MEDIUM', color: '#F5A623', bg: 'bg-amber-500/10' },
                { range: '65 - 100', level: 'HIGH', color: '#E8453C', bg: 'bg-red-500/10' }
              ].map((r, i) => (
                <div key={i} className={`p-6 rounded-2xl border border-white/5 flex items-center justify-between ${r.bg} shadow-lg`}>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-1">Index Range</p>
                     <p className="text-2xl font-black text-white font-mono">{r.range}</p>
                   </div>
                   <div className="text-right">
                     <Badge variant="outline" className="h-8 px-6 font-black uppercase tracking-widest text-[10px]" style={{ color: r.color, borderColor: `${r.color}30` }}>
                        {r.level} SEVERITY
                     </Badge>
                     <p className="text-[9px] font-bold text-zinc-500 uppercase mt-2 group-hover:text-white transition-colors tracking-tighter">Automatic Response Priority {3-i}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* SMS Templates */}
        <div className="space-y-6">
           <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-accent_amber" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Response Automation</h3>
           </div>
           <Card className="bg-[#111111] border-white/5 rounded-3xl overflow-hidden shadow-2xl p-2 relative">
             <div className="absolute inset-0 bg-accent_amber/[0.02] pointer-events-none" />
             <CardHeader className="p-6">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">SOS Outbound Template</CardTitle>
             </CardHeader>
             <CardContent className="p-6 pt-0 space-y-6">
                <div className="bg-black/40 border border-white/5 rounded-2xl p-6 relative group overflow-hidden">
                   <div className="absolute top-0 right-0 p-3"><Info className="h-4 w-4 text-zinc-700 opacity-50" /></div>
                   <p className="text-sm font-medium leading-relaxed text-zinc-300">
                     EMERGENCY: Veera Alert at <span className="text-accent_amber font-bold font-mono">#LAT, #LNG</span>. 
                     Safety Score: <span className="text-accent_red font-bold font-mono">#SCORE (#LEVEL)</span>. 
                     Please respond immediately. Support at <span className="text-accent_green font-bold font-mono">#NEARBY#STATION</span>.
                   </p>
                </div>
                <div className="flex flex-wrap gap-2">
                   {['#LAT', '#LNG', '#SCORE', '#LEVEL', '#TIME'].map(v => (
                     <Badge key={v} variant="outline" className="bg-accent_amber/5 border-accent_amber/20 text-accent_amber text-[9px] font-black uppercase shadow-sm">
                        {v}
                     </Badge>
                   ))}
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                   <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 italic">Security Note</p>
                   <p className="text-[11px] text-zinc-500 font-medium">This template is locked by regional administration rules and cannot be modified from the current terminal.</p>
                </div>
             </CardContent>
           </Card>
        </div>
      </div>

      {/* Police Stations Read Only */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4 text-accent_green" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Response Node Availability</h3>
        </div>
        <div className="bg-[#111111] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent_green/5 blur-[120px] rounded-full pointer-events-none -z-10" />
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
                ))
             ) : (
                stations.map((s, i) => (
                  <div key={i} className="bg-black/40 border border-white/5 p-6 rounded-2xl hover:border-accent_green/30 transition-all group shadow-xl">
                    <div className="flex items-start justify-between">
                       <div className="p-3 bg-accent_green/10 rounded-xl group-hover:scale-110 transition-transform">
                         <Shield className="h-5 w-5 text-accent_green" />
                       </div>
                       <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-600 hover:text-white rounded-lg">
                          <ExternalLink className="h-4 w-4" />
                       </Button>
                    </div>
                    <div className="mt-6 space-y-2">
                       <h4 className="text-sm font-black text-white uppercase tracking-tight truncate group-hover:text-accent_green transition-colors">{s.name}</h4>
                       <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <span className="h-1.5 w-1.5 bg-accent_green rounded-full shadow-[0_0_8px_rgba(46,204,113,0.5)]" />
                            {s.type || 'POLICE HQ'}
                          </p>
                          <p className="text-[11px] font-black text-white font-mono">{s.distance_km?.toFixed(1)}KM</p>
                       </div>
                    </div>
                  </div>
                ))
             )}
           </div>
        </div>
      </div>

      {/* System Info Full Width */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { icon: Database, label: 'Backend Terminal', value: 'v4.5.12-NODE', status: 'SYNCHRONIZED' },
           { icon: Globe, label: 'Deployment Region', value: 'INDIAN-WEST-01', status: 'OPTIMAL' },
           { icon: Cpu, label: 'ML Engine Version', value: 'TENSOR-FLOW-2.4', status: 'CONNECTED' }
         ].map((sys, i) => (
           <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl flex items-center gap-6 shadow-xl transition-all hover:bg-white/[0.03]">
              <div className="p-4 bg-white/5 rounded-2xl">
                 <sys.icon className="h-6 w-6 text-zinc-400" />
              </div>
              <div className="space-y-1">
                 <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">{sys.label}</p>
                 <p className="text-sm font-black text-white tracking-widest">{sys.value}</p>
                 <p className="text-[9px] font-bold text-accent_green uppercase tracking-tighter shadow-sm">{sys.status}</p>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default Settings;
