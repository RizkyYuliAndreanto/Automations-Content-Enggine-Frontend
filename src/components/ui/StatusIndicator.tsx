import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface StatusIndicatorProps {
  status: "success" | "error" | "warning" | "loading" | "idle";
  label?: string;
  size?: "sm" | "md";
}

export function StatusIndicator({
  status,
  label,
  size = "md",
}: StatusIndicatorProps) {
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  const icons = {
    success: <CheckCircle className={`${iconSize} text-green-400`} />,
    error: <XCircle className={`${iconSize} text-red-400`} />,
    warning: <AlertCircle className={`${iconSize} text-yellow-400`} />,
    loading: <Loader2 className={`${iconSize} text-blue-400 animate-spin`} />,
    idle: (
      <div
        className={`${size === "sm" ? "w-3 h-3" : "w-4 h-4"} rounded-full bg-gray-500`}
      />
    ),
  };

  const colors = {
    success: "text-green-400",
    error: "text-red-400",
    warning: "text-yellow-400",
    loading: "text-blue-400",
    idle: "text-gray-400",
  };

  return (
    <div className="flex items-center gap-2">
      {icons[status]}
      {label && (
        <span className={`${textSize} ${colors[status]}`}>{label}</span>
      )}
    </div>
  );
}

interface StatusListProps {
  items: { key: string; label: string; ok: boolean }[];
}

export function StatusList({ items }: StatusListProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.key} className="flex items-center justify-between py-1">
          <span className="text-sm text-gray-300">{item.label}</span>
          <StatusIndicator status={item.ok ? "success" : "error"} size="sm" />
        </div>
      ))}
    </div>
  );
}
