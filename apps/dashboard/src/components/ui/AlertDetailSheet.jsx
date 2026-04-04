import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import RiskGauge from "./RiskGauge";
import RiskBadge from "./RiskBadge";
import { MapPin, Phone, Shield, ExternalLink, Clock } from "lucide-react";
import { Button } from "./button";
import { Separator } from "./separator";
import React from 'react';

const AlertDetailSheet = ({ alert, isOpen, onOpenChange }) => {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (isOpen && alert) {
      const fetchDetails = async () => {
        try {
          setLoading(true);
          const [riskRes, stationRes] = await Promise.all([
            api.post('/api/risk-score', {
              latitude: alert.latitude,
              longitude: alert.longitude,
              timestamp: alert.createdAt
            }),
            api.post('/api/risk-score/nearest-stations', {
              latitude: alert.latitude,
              longitude: alert.longitude
            })
          ]);
          setDetails({
            risk: riskRes.data.data,
            stations: stationRes.data.data
          });
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, alert]);

  if (!alert) return null;

  const mapsUrl = `https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="bg-[#0A0A0A] border-white/5 w-full sm:max-w-lg overflow-y-auto custom-scrollbar">
        <SheetHeader className="text-left">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              <div className="h-2 w-2 rounded-full pulse-red" />
              Alert Details
            </SheetTitle>
            <RiskBadge level={details?.risk?.risk_level || "HIGH"} />
          </div>
          <SheetDescription className="text-zinc-500 font-mono text-xs mt-1">
            {alert._id} • {new Date(alert.createdAt).toLocaleString()}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-8">
          {/* Coordinates & Location */}
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-accent_red/20 rounded-lg">
                  <MapPin className="h-5 w-5 text-accent_red" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Location</p>
                  <p className="text-lg font-bold mt-0.5">{alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}</p>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="hover:bg-white/5" asChild>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Risk Gauge Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Live Risk Assessment</h3>
            <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl flex flex-col items-center">
              {loading ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="h-10 w-10 border-4 border-accent_red/30 border-t-accent_red rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <RiskGauge score={details?.risk?.risk_score || 0} />
                  <div className="grid grid-cols-2 gap-4 w-full mt-4">
                    {details?.risk?.risk_factors?.map((factor, i) => (
                      <div key={i} className="text-[10px] bg-white/5 border border-white/5 p-2 rounded-lg text-zinc-400">
                        {factor}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Nearest Stations Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Nearest Police Stations</h3>
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-20 bg-white/5 border border-white/5 rounded-xl animate-pulse" />
                ))
              ) : (
                details?.stations?.map((station, i) => (
                  <div key={i} className="bg-bg_card border border-white/5 p-4 rounded-xl flex items-center justify-between group transition-colors hover:border-accent_green/30">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-accent_green/10 rounded-xl">
                        <Shield className="h-5 w-5 text-accent_green" />
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate max-w-[200px]">{station.name}</p>
                        <p className="text-[11px] text-zinc-500 flex items-center gap-1 font-medium">
                          <MapPin className="h-3 w-3" /> {station.distance_km?.toFixed(2)} km away
                        </p>
                      </div>
                    </div>
                    <Button size="icon" variant="outline" className="rounded-full border-zinc-800 hover:bg-accent_green hover:text-black">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AlertDetailSheet;
