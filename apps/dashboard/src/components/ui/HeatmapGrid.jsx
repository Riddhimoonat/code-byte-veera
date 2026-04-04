import { cn } from "@/lib/utils";
import React from "react";

const HeatmapGrid = ({ data = [], loading }) => {
  const getRiskStyles = (level) => {
    switch(level) {
      case 'HIGH': return 'bg-red-600/20 border-red-500/40 text-red-500';
      case 'MEDIUM': return 'bg-amber-500/10 border-amber-500/30 text-amber-500';
      case 'LOW': return 'bg-green-500/10 border-green-500/30 text-green-500';
      default: return 'bg-white/5 border-white/5 text-zinc-600';
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 w-full">
      {loading ? (
        Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] rounded-xl bg-white/5 border border-white/5 animate-pulse" />
        ))
      ) : (
        data.map((point, i) => (
          <div
            key={i}
            className={cn(
              "aspect-[4/3] rounded-xl border flex flex-col items-center justify-center gap-1 group transition-all hover:scale-[1.02]",
              getRiskStyles(point.risk_level)
            )}
          >
            <div className="text-2xl font-black">{Math.round(point.risk_score)}</div>
            <div className="text-[9px] uppercase font-bold tracking-[0.1em] opacity-80 group-hover:opacity-100 transition-opacity">
              {point.risk_level} Risk
            </div>
            <div className="text-[8px] mt-1 text-zinc-500 font-mono hidden group-hover:block">
              {point.latitude.toFixed(3)}, {point.longitude.toFixed(3)}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default HeatmapGrid;
