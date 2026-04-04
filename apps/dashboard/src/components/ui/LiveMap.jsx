import { MapContainer, TileLayer, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import React from "react";

const LiveMap = ({ alerts = [], center = [23.2599, 77.4126], zoom = 12 }) => {
  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        className="h-full w-full rounded-xl overflow-hidden border border-white/5"
        style={{ background: '#0D0D0D' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {alerts.map((alert) => (
          <CircleMarker
            key={alert._id}
            center={[alert.latitude, alert.longitude]}
            radius={8}
            pathOptions={{
              color: '#E8453C',
              fillColor: '#E8453C',
              fillOpacity: 0.6,
              weight: 2,
              className: 'pulse-red'
            }}
          >
            <Popup className="dark-leaflet-popup">
              <div className="p-1 space-y-1">
                <p className="text-[10px] font-bold text-accent_red uppercase">Active SOS</p>
                <div className="text-[11px] text-zinc-300">
                  <p>Lat: {alert.latitude.toFixed(4)}</p>
                  <p>Lng: {alert.longitude.toFixed(4)}</p>
                  <p className="mt-1 text-zinc-500 font-mono">
                    {new Date(alert.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      
      <style>{`
        .dark-leaflet-popup .leaflet-popup-content-wrapper {
          background: #111111;
          color: white;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
        }
        .dark-leaflet-popup .leaflet-popup-tip {
          background: #111111;
        }
        .leaflet-container {
          filter: grayscale(1) invert(1) contrast(1.1) brightness(0.6) hue-rotate(180deg);
        }
      `}</style>
    </div>
  );
};

export default LiveMap;
