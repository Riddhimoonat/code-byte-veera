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
        setStations(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-8 animate-in fade-in slide-in-from-right-4 duration-700 pb-20">
      <header className="mb-12 border-b border-white/10 pb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent_green/10 rounded-xl">
              <Info className="h-6 w-6 text-accent_green" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">System Configuration</h1>
              <p className="text-sm font-medium text-zinc-400 mt-1">Central Console Security Parameters & Automation</p>
            </div>
          </div>
      </header>

      <div className="space-y-12">
        
        {/* Risk Thresholds */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1 space-y-2">
              <div className="flex items-center gap-2 text-zinc-200">
                <Zap className="h-5 w-5 text-accent_red" />
                <h3 className="text-lg font-semibold">Severity Protocol</h3>
              </div>
              <p className="text-sm text-zinc-500">
                Configure automatic system severity indexes and mapping responses. These values dictate ML event handling.
              </p>
           </div>
           
           <div className="lg:col-span-2 grid grid-cols-1 gap-4">
              {[
                { range: '00 - 29', level: 'Low', color: '#2ECC71', bg: 'bg-[#111111]' },
                { range: '30 - 64', level: 'Medium', color: '#F5A623', bg: 'bg-[#111111]' },
                { range: '65 - 100', level: 'High', color: '#E8453C', bg: 'bg-[#111111]' }
              ].map((r, i) => (
                <div key={i} className={`p-6 rounded-2xl border border-white/5 flex items-center justify-between shadow-sm transition-colors hover:border-white/20 ${r.bg}`}>
                   <div>
                     <p className="text-sm font-medium text-zinc-500 mb-1">Index Range</p>
                     <p className="text-2xl font-bold text-zinc-200 font-mono tracking-tight">{r.range}</p>
                   </div>
                   <div className="text-right flex flex-col items-end">
                     <Badge variant="outline" className="h-8 px-4 font-semibold text-sm" style={{ color: r.color, borderColor: `${r.color}30`, backgroundColor: `${r.color}10` }}>
                        {r.level}
                     </Badge>
                     <p className="text-sm font-medium text-zinc-500 mt-2">Priority Level {3-i}</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        <hr className="border-white/5" />

        {/* SMS Templates */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1 space-y-2">
              <div className="flex items-center gap-2 text-zinc-200">
                <Shield className="h-5 w-5 text-accent_amber" />
                <h3 className="text-lg font-semibold">Response Automation</h3>
              </div>
              <p className="text-sm text-zinc-500">
                Manage outbound SOS message formatting and dispatch templates to local enforcement.
              </p>
           </div>
           
           <div className="lg:col-span-2">
             <Card className="bg-[#111111] border-white/5 rounded-2xl overflow-hidden shadow-lg p-0">
               <CardHeader className="p-6 border-b border-white/5 bg-[#141414]">
                  <CardTitle className="text-base font-semibold text-zinc-200">Outbound SMS Template</CardTitle>
               </CardHeader>
               <CardContent className="p-6 space-y-6">
                  <div className="bg-black/40 border border-white/10 rounded-xl p-6 relative">
                     <p className="text-base font-medium leading-relaxed text-zinc-300">
                       EMERGENCY: Veera Alert at <span className="text-accent_amber font-bold font-mono">#LAT, #LNG</span>. 
                       Safety Score: <span className="text-accent_red font-bold font-mono">#SCORE (#LEVEL)</span>. 
                       Please respond immediately. Support at <span className="text-accent_green font-bold font-mono">#NEARBY#STATION</span>.
                     </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     <span className="text-sm font-medium text-zinc-500 mr-2 flex items-center">Variables:</span>
                     {['#LAT', '#LNG', '#SCORE', '#LEVEL', '#TIME'].map(v => (
                       <Badge key={v} variant="outline" className="bg-accent_amber/10 border-accent_amber/20 text-accent_amber text-xs font-semibold shadow-sm px-3 py-1">
                          {v}
                       </Badge>
                     ))}
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 text-zinc-400">
                     <Info className="h-5 w-5 flex-shrink-0" />
                     <p className="text-sm">Template locked by administrative policy and cannot be altered.</p>
                  </div>
               </CardContent>
             </Card>
           </div>
        </section>

        <hr className="border-white/5" />

        {/* Police Stations Read Only */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1 space-y-2">
              <div className="flex items-center gap-2 text-zinc-200">
                <MapPin className="h-5 w-5 text-accent_green" />
                <h3 className="text-lg font-semibold">Response Node Targets</h3>
              </div>
              <p className="text-sm text-zinc-500">
                List of real-time operational hubs available for automated dispatch near HQ.
              </p>
           </div>
           
           <div className="lg:col-span-2">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-28 bg-[#111111] rounded-xl animate-pulse" />
                  ))
               ) : (
                  stations.map((s, i) => (
                    <div key={i} className="bg-[#111111] border border-white/5 p-6 rounded-xl transition-all group hover:border-white/20">
                      <div className="flex items-start justify-between">
                         <div className="p-3 bg-accent_green/10 rounded-lg shrink-0">
                           <Shield className="h-5 w-5 text-accent_green" />
                         </div>
                         <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white shrink-0 ml-2">
                            <ExternalLink className="h-4 w-4" />
                         </Button>
                      </div>
                      <div className="mt-4">
                         <h4 className="text-base font-semibold text-zinc-200 truncate">{s.name}</h4>
                         <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-zinc-400 uppercase flex items-center gap-2">
                              <span className="h-1.5 w-1.5 bg-accent_green rounded-full shadow-[0_0_5px_rgba(46,204,113,0.8)]" />
                              {s.type || 'POLICE HQ'}
                            </p>
                            <p className="text-sm font-semibold text-zinc-300 font-mono">{s.distance_km?.toFixed(1)} km</p>
                         </div>
                      </div>
                    </div>
                  ))
               )}
             </div>
           </div>
        </section>

        <hr className="border-white/5" />

        {/* System Info */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1 space-y-2">
              <div className="flex items-center gap-2 text-zinc-200">
                <Database className="h-5 w-5 text-zinc-400" />
                <h3 className="text-lg font-semibold">Service Status</h3>
              </div>
              <p className="text-sm text-zinc-500">
                Core infrastructure integration levels and cluster connection health.
              </p>
           </div>
           
           <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
               {[
                 { icon: Database, label: 'Backend Server', value: 'v4.5.node', status: 'Optimal' },
                 { icon: Globe, label: 'Cloud Region', value: 'in-west-01', status: 'Secured' },
                 { icon: Cpu, label: 'ML Engine', value: 'keras-2.4', status: 'Connected' }
               ].map((sys, i) => (
                 <div key={i} className="bg-[#111111] border border-white/5 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:border-white/20 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white/5 rounded-lg shrink-0">
                         <sys.icon className="h-5 w-5 text-zinc-400" />
                      </div>
                      <p className="text-sm text-zinc-500 font-medium">{sys.label}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-base font-semibold text-zinc-200 break-all">{sys.value}</p>
                       <p className="text-xs font-semibold text-accent_green flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-accent_green animate-pulse" />
                         {sys.status}
                       </p>
                    </div>
                 </div>
               ))}
           </div>
        </section>

      </div>
    </div>
  );
};

export default Settings;
