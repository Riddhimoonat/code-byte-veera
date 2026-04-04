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
    <div className="max-w-6xl mx-auto py-8 animate-in fade-in slide-in-from-left-4 duration-500 pb-20">
      
      {/* Page Header */}
      <header className="mb-10 text-left">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent_red/10 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-accent_red" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Alert Archive</h1>
              <p className="text-sm font-medium text-zinc-400 mt-1">Comprehensive Crisis Database Log</p>
            </div>
          </div>
      </header>
      
      {/* Search & Filter Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-[#111111] p-2 rounded-xl border border-white/5 shadow-sm w-full sm:w-auto">
           <div className="relative flex-1 sm:flex-none">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <Input 
                placeholder="Search Incident ID or GPS..." 
                className="pl-10 w-full sm:w-[320px] h-10 bg-black/40 border-white/10 text-sm focus:border-zinc-500 transition-all rounded-lg placeholder:text-zinc-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <Select value={statusFilter} onValueChange={setStatusFilter}>
             <SelectTrigger className="w-[160px] h-10 bg-black/40 border-white/10 text-sm rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-zinc-400" />
                  <SelectValue placeholder="Status" />
                </div>
             </SelectTrigger>
             <SelectContent className="bg-[#141414] border-white/10 text-zinc-200">
                <SelectItem value="all" className="text-sm py-2">All Stations</SelectItem>
                <SelectItem value="active" className="text-sm py-2 text-accent_red">Active SOS</SelectItem>
                <SelectItem value="dispatched" className="text-sm py-2 text-accent_amber">Dispatched</SelectItem>
                <SelectItem value="resolved" className="text-sm py-2 text-accent_green">Resolved</SelectItem>
             </SelectContent>
           </Select>
        </div>
      </div>

      {/* Main Table Block */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
        <Table>
           <TableHeader className="bg-[#141414] border-b border-white/5">
             <TableRow className="border-white/5 hover:bg-transparent">
               <TableHead className="font-semibold text-sm text-zinc-400 py-4 pl-6">Incident Signal</TableHead>
               <TableHead className="font-semibold text-sm text-zinc-400 py-4 text-center">Location Coordinates</TableHead>
               <TableHead className="font-semibold text-sm text-zinc-400 py-4 text-center">Timestamp</TableHead>
               <TableHead className="font-semibold text-sm text-zinc-400 py-4 text-center">Status</TableHead>
               <TableHead className="font-semibold text-sm text-zinc-400 py-4 text-right pr-6">Actions</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell colSpan={6} className="h-24 animate-pulse bg-white/[0.01]" />
                  </TableRow>
                ))
             ) : (
                filteredAlerts.map((alert) => (
                   <TableRow key={alert._id} className="border-white/5 hover:bg-white/[0.03] transition-all group h-16">
                     <TableCell className="pl-6">
                       <p className="text-[15px] font-semibold text-zinc-200 font-mono">
                         {alert._id.slice(-8).toUpperCase()}
                       </p>
                     </TableCell>
                     <TableCell className="text-center">
                       <p className="text-sm text-zinc-300 font-mono">
                         {alert.latitude.toFixed(5)}, {alert.longitude.toFixed(5)}
                       </p>
                     </TableCell>
                     <TableCell className="text-center">
                       <div className="inline-flex flex-col items-center">
                         <p className="text-sm font-medium text-zinc-200">
                           {format(new Date(alert.createdAt), 'HH:mm:ss')}
                         </p>
                         <p className="text-xs text-zinc-500 mt-0.5">
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
                            "h-9 mx-auto w-[130px] bg-white/5 border-white/10 text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors shadow-sm",
                            (mockStatuses[alert._id] || "Active") === "Active" ? "text-accent_red" : 
                            (mockStatuses[alert._id]) === "Resolved" ? "text-accent_green" : "text-accent_amber"
                          )}>
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#141414] border-white/10 shadow-lg">
                             <SelectItem value="Active" className="text-accent_red font-medium py-2">Active</SelectItem>
                             <SelectItem value="Dispatched" className="text-accent_amber font-medium py-2">Dispatched</SelectItem>
                             <SelectItem value="Resolved" className="text-accent_green font-medium py-2">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                     </TableCell>
                     <TableCell className="text-right pr-6">
                       <Button 
                         size="icon" 
                         variant="ghost" 
                         className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all border border-transparent group-hover:border-white/10"
                         onClick={() => openAlert(alert)}
                       >
                          <Eye className="h-5 w-5" />
                       </Button>
                     </TableCell>
                   </TableRow>
                ))
             )}
           </TableBody>
        </Table>
        
        {/* Pagination */}
        <div className="p-4 border-t border-white/5 bg-[#141414] flex items-center justify-between px-6">
           <p className="text-sm font-medium text-zinc-500">
             Showing <span className="text-zinc-300">{filteredAlerts.length}</span> of <span className="text-zinc-300">{meta?.total || 0}</span> signals
           </p>
           <div className="flex items-center gap-3">
             <Button 
               variant="outline" 
               size="icon" 
               disabled={page === 1} 
               onClick={() => setPage(page - 1)}
               className="h-9 w-9 bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
             >
               <ChevronLeft className="h-5 w-5" />
             </Button>
             <span className="text-sm font-semibold text-white bg-accent_red/20 px-4 py-1.5 rounded-lg border border-accent_red/30">
               Page {page}
             </span>
             <Button 
               variant="outline" 
               size="icon" 
               disabled={meta ? page >= Math.ceil(meta.total / 20) : true} 
               onClick={() => setPage(page + 1)}
               className="h-9 w-9 bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
             >
               <ChevronRight className="h-5 w-5" />
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
