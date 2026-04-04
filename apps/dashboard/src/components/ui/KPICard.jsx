import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const KPICard = ({ title, value, icon: Icon, accentColor, pulse, className }) => {
  return (
    <Card className={cn(
      "relative overflow-hidden bg-[#141414] border-border border-l-[3px] p-4 flex items-center justify-between",
      className
    )}
    style={{ borderLeftColor: accentColor }}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium text-text_secondary">{title}</p>
        <div className="flex items-center gap-2">
          <h3 className="text-2xl font-bold text-text_primary">{value}</h3>
          {pulse && <div className={cn("h-2.5 w-2.5 rounded-full", pulse === 'red' ? 'pulse-red' : 'pulse-green')} />}
        </div>
      </div>
      <div className="p-2 rounded-lg bg-white/5">
        <Icon className={cn("h-5 w-5")} style={{ color: accentColor }} />
      </div>
    </Card>
  );
};

export default KPICard;
