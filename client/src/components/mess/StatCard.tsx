import { cn } from "@/lib/utils";

export default function StatCard({
  title,
  value,
  icon: Icon,
  highlight,
  danger,
  footer,
  className,
}: {
  title: string;
  value: string | number;
  icon: any;
  highlight?: boolean;
  danger?: boolean;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-5 space-y-2",
        highlight && "border-emerald-500/40",
        danger && "border-red-500/40",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="text-2xl font-bold tracking-tight">
        {value}
      </div>

      {footer && <div>{footer}</div>}
    </div>
  );
}
