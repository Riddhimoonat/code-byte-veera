import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const RiskBadge = ({ level, className }) => {
  const styles = {
    LOW: "bg-green-500/15 text-accent_green border-green-500/30",
    MEDIUM: "bg-amber-500/15 text-accent_amber border-amber-500/30",
    HIGH: "bg-red-500/15 text-accent_red border-red-500/30",
  };

  return (
    <Badge
      variant="outline"
      className={cn("px-2 py-0.5 font-medium tracking-wide", styles[level] || styles.LOW, className)}
    >
      {level}
    </Badge>
  );
};

export default RiskBadge;
