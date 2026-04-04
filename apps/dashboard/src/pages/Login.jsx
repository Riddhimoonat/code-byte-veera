import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [mockOtp, setMockOtp] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone) return toast.error("Phone number is required");
    try {
      setLoading(true);
      const res = await api.post("/api/auth/login", { phone });
      setMockOtp(res.data.mockedOtp);
      setStep(2);
      toast.success("OTP access key generated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signal interruption: Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error("OTP is required");
    try {
      setLoading(true);
      const res = await api.post("/api/auth/verify-otp", { phone, otp });
      localStorage.setItem("veera_token", res.data.token);
      toast.success("Authentication confirmed. Access granted.");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials provided");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0A0A0A] p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent_red/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      
      <Card className="w-full max-w-[420px] bg-[#111111]/80 backdrop-blur-xl border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-accent_red/50 to-transparent" />
        
        <CardHeader className="space-y-6 text-center pt-10">
          <div className="mx-auto w-14 h-14 bg-accent_red/10 rounded-2xl flex items-center justify-center border border-accent_red/20 rotate-6 shadow-[0_0_15px_rgba(232,69,60,0.1)] hover:rotate-0 transition-all duration-500">
            <Shield className="h-8 w-8 text-accent_red" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tight text-white uppercase italic">VEERA <span className="text-accent_red not-italic">ADMIN</span></CardTitle>
            <CardDescription className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]">Secure Terminal Authentication</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-12 pt-4">
          {step === 1 ? (
             <form onSubmit={handleLogin} className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Terminal ID (Phone)</label>
                 <Input 
                   type="tel"
                   placeholder="000 000 0000" 
                   value={phone}
                   onChange={(e) => setPhone(e.target.value)}
                   className="h-14 bg-white/[0.02] border-white/10 focus:border-accent_red/40 text-center text-lg font-mono tracking-widest transition-all rounded-xl"
                   required
                 />
               </div>
               <Button className="w-full h-14 bg-accent_red hover:bg-red-600 text-white font-black tracking-widest text-sm shadow-[0_4px_20px_rgba(232,69,60,0.2)] rounded-xl" disabled={loading}>
                 {loading ? "TRANSMITTING..." : "GENERATE ACCESS KEY"}
               </Button>
               <div className="flex items-center justify-center gap-2 opacity-50">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent_red" />
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Protocol v2.4.0 active</p>
               </div>
             </form>
          ) : (
             <form onSubmit={handleVerify} className="space-y-6">
               <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Access Code (OTP)</label>
                   <Input 
                     type="text"
                     placeholder="· · · · · ·" 
                     value={otp}
                     onChange={(e) => setOtp(e.target.value)}
                     className="h-14 bg-white/[0.02] border-white/10 focus:border-accent_red/40 text-center text-2xl font-black tracking-[0.4em] transition-all rounded-xl"
                     required
                     maxLength={6}
                   />
                 </div>
                 {mockOtp && (
                   <div className="bg-accent_amber/10 border border-accent_amber/20 p-3 rounded-xl flex items-center justify-center">
                     <p className="text-[10px] text-accent_amber font-black tracking-widest uppercase">
                       DEBUG BYPASS: {mockOtp}
                     </p>
                   </div>
                 )}
               </div>
               <Button className="w-full h-14 bg-accent_red hover:bg-red-600 text-white font-black tracking-widest text-sm shadow-[0_4px_20px_rgba(232,69,60,0.2)] rounded-xl" disabled={loading}>
                 {loading ? "VALIDATING..." : "GRANT TERMINAL ACCESS"}
               </Button>
               <Button 
                variant="link" 
                className="w-full text-[10px] text-zinc-600 hover:text-white uppercase font-black tracking-[0.2em] transition-colors" 
                onClick={() => setStep(1)} 
                type="button"
               >
                  Resubmit Terminal ID
               </Button>
             </form>
          )}
        </CardContent>
      </Card>
      
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-zinc-800 text-[10px] font-black uppercase tracking-[0.3em] select-none">
        Property of Veera Intelligence Branch
      </div>
    </div>
  );
};

export default Login;
