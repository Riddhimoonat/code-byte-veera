import { toast } from "sonner";
import { Bell } from "lucide-react";

export const showSOSToast = (alert) => {
  toast.error(`NEW EMERGENCY ALERT`, {
    description: `New SOS triggered at ${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}. Priority action required.`,
    icon: <Bell className="h-5 w-5 text-accent_red" />,
    duration: 6000,
    className: "bg-[#0A0A0A] border-l-4 border-l-accent_red border-white/5 text-text_primary shadow-2xl",
    action: {
      label: "VIEW",
      onClick: () => window.location.href = `/alerts?id=${alert._id}`
    }
  });
};
