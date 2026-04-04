import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const KPICard = ({ title, value, icon: Icon, accentColor, pulse, className }) => {
  return (
    <Card className={cn(
      "relative group overflow-hidden bg-[#141414] border-white/10 border-l-[3px] p-4 flex items-center justify-between transition-all hover:shadow-lg",
      className
    )}
    style={{ borderLeftColor: accentColor }}
    >
      <div className="space-y-1">
        <p className="text-[13px] font-medium text-zinc-400">{title}</p>
        <div className="flex items-center gap-2">
          <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
          {pulse && <div className={cn("h-2 w-2 rounded-full", pulse === 'red' ? 'pulse-red' : 'pulse-green')} />}
        </div>
      </div>
      <div className="p-2 rounded-lg bg-white/5 transition-transform group-hover:scale-105">
        <Icon className={cn("h-5 w-5")} style={{ color: accentColor }} />
      </div>
    </Card>
  );
};

export default KPICard;
