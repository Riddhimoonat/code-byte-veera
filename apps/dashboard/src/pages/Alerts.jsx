import React, { useState, useMemo, useEffect } from "react";
import { useAlerts } from "@/hooks/useAlerts";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { Eye, Search, AlertTriangle, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RiskBadge from "@/components/ui/RiskBadge";
import AlertDetailSheet from "@/components/ui/AlertDetailSheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const Alerts = () => {
  const { alerts, loading, page, setPage, meta } = useAlerts(1, 20);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Local state for mocked status (since API is broken)
  const [mockStatuses, setMockStatuses] = useState({});

  const handleStatusChange = (alertId, status) => {
    setMockStatuses(prev => ({ ...prev, [alertId]: status }));
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchSearch = String(a._id).toLowerCase().includes(searchTerm.toLowerCase()) || 
                          String(a.latitude).includes(searchTerm) || 
                          String(a.longitude).includes(searchTerm);
      const currentStatus = mockStatuses[a._id] || "Active";
      const matchStatus = statusFilter === "all" || currentStatus.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [alerts, searchTerm, statusFilter, mockStatuses]);

  const openAlert = (alert) => {
    setSelectedAlert(alert);
    setIsSheetOpen(true);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const alertId = urlParams.get('id');
    if (alertId && alerts.length > 0) {
      const alert = alerts.find(a => a._id === alertId);
      if (alert) openAlert(alert);
    }
  }, [alerts]);

  return (
    <div className="space-y-8 py-4 animate-in fade-in slide-in-from-left-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
            <span className="p-2 bg-accent_red/20 rounded-xl"><AlertTriangle className="h-6 w-6 text-accent_red" /></span>
            ALERT ARCHIVE
          </h1>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-1 ml-1">Comprehensive Crisis Database Log</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-[#111111] p-2 rounded-2xl border border-white/5">
           <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
              <Input 
                placeholder="INCIDENT ID / GPS" 
                className="pl-12 w-[240px] h-12 bg-black/40 border-white/5 text-[11px] font-bold tracking-widest focus:border-accent_red/30 transition-all rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <Select value={statusFilter} onValueChange={setStatusFilter}>
             <SelectTrigger className="w-[160px] h-12 bg-black/40 border-white/5 text-[11px] font-bold tracking-widest rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2">
                  <Filter className="h-3 w-3 text-zinc-500" />
                  <SelectValue placeholder="STATUS" />
                </div>
             </SelectTrigger>
             <SelectContent className="bg-[#111111] border-white/10 text-white">
                <SelectItem value="all">ALL STATIONS</SelectItem>
                <SelectItem value="active">ACTIVE SOS</SelectItem>
                <SelectItem value="dispatched">DISPATCHED</SelectItem>
                <SelectItem value="resolved">RESOLVED</SelectItem>
             </SelectContent>
           </Select>
        </div>
      </header>

      <div className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
        <Table>
           <TableHeader className="bg-white/[0.01]">
             <TableRow className="border-white/5 hover:bg-transparent">
               <TableHead className="font-black text-[10px] uppercase tracking-widest text-zinc-500 py-6 pl-8">Incident Signal</TableHead>
               <TableHead className="font-black text-[10px] uppercase tracking-widest text-zinc-500 py-6 text-center">Coordinate Matrix</TableHead>
               <TableHead className="font-black text-[10px] uppercase tracking-widest text-zinc-500 py-6 text-center">Epoch</TableHead>
               <TableHead className="font-black text-[10px] uppercase tracking-widest text-zinc-500 py-6 text-center">Protocol Status</TableHead>
               <TableHead className="font-black text-[10px] uppercase tracking-widest text-zinc-500 py-6 text-right pr-8">Actions</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell colSpan={6} className="h-20 animate-pulse bg-white/[0.01]" />
                  </TableRow>
                ))
             ) : (
                filteredAlerts.map((alert) => (
                   <TableRow key={alert._id} className="border-white/5 hover:bg-white/[0.02] transition-all group">
                     <TableCell className="pl-8 py-5">
                       <p className="text-xs font-black text-white tracking-widest font-mono opacity-60 group-hover:opacity-100 transition-opacity">
                         {alert._id.slice(-8).toUpperCase()}
                       </p>
                     </TableCell>
                     <TableCell className="text-center">
                       <p className="text-xs font-bold text-zinc-300 font-mono">
                         {alert.latitude.toFixed(5)}, {alert.longitude.toFixed(5)}
                       </p>
                     </TableCell>
                     <TableCell className="text-center">
                       <div className="inline-flex flex-col items-center">
                         <p className="text-[11px] font-black text-white tracking-tight">
                           {format(new Date(alert.createdAt), 'HH:mm:ss')}
                         </p>
                         <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">
                           {format(new Date(alert.createdAt), 'dd MMM yyyy')}
                         </p>
                       </div>
                     </TableCell>
                     <TableCell className="text-center">
                        <Select 
                          value={mockStatuses[alert._id] || "Active"} 
                          onValueChange={(val) => handleStatusChange(alert._id, val)}
                        >
                          <SelectTrigger className={cn(
                            "h-8 mx-auto w-[120px] bg-white/5 border-white/10 text-[9px] font-black uppercase tracking-widest rounded-lg",
                            (mockStatuses[alert._id] || "Active") === "Active" ? "text-accent_red" : 
                            (mockStatuses[alert._id]) === "Resolved" ? "text-accent_green" : "text-accent_amber"
                          )}>
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#181818] border-white/10">
                             <SelectItem value="Active" className="text-accent_red font-bold text-[10px]">ACTIVE</SelectItem>
                             <SelectItem value="Dispatched" className="text-accent_amber font-bold text-[10px]">DISPATCHED</SelectItem>
                             <SelectItem value="Resolved" className="text-accent_green font-bold text-[10px]">RESOLVED</SelectItem>
                          </SelectContent>
                        </Select>
                     </TableCell>
                     <TableCell className="text-right pr-8">
                       <Button 
                         size="icon" 
                         variant="ghost" 
                         className="h-9 w-9 bg-accent_red/10 text-accent_red hover:bg-accent_red hover:text-white rounded-lg shadow-xl translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                         onClick={() => openAlert(alert)}
                       >
                          <Eye className="h-4 w-4" />
                       </Button>
                     </TableCell>
                   </TableRow>
                ))
             )}
           </TableBody>
        </Table>
        
        {/* Pagination */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between px-8">
           <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
             Showing {filteredAlerts.length} of {meta.total} Signals
           </p>
           <div className="flex items-center gap-2">
             <Button 
               variant="ghost" 
               size="icon" 
               disabled={page === 1} 
               onClick={() => setPage(page - 1)}
               className="h-8 w-8 hover:bg-white/5"
             >
               <ChevronLeft className="h-4 w-4" />
             </Button>
             <span className="text-xs font-black text-white bg-accent_red/20 px-3 py-1 rounded-md border border-accent_red/30">
               {page}
             </span>
             <Button 
               variant="ghost" 
               size="icon" 
               disabled={page >= Math.ceil(meta.total / 20)} 
               onClick={() => setPage(page + 1)}
               className="h-8 w-8 hover:bg-white/5"
             >
               <ChevronRight className="h-4 w-4" />
             </Button>
           </div>
        </div>
      </div>

      <AlertDetailSheet 
        alert={selectedAlert} 
        isOpen={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
      />
    </div>
  );
};

export default Alerts;
