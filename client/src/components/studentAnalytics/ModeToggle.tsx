import { Button } from "@/components/ui/button";
import {type AnalyticsMode } from "./types";

export default function ModeToggle({
  value,
  onChange,
}: {
  value: AnalyticsMode;
  onChange: (v: AnalyticsMode) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border bg-muted p-1">
      {["meals", "revenue"].map((mode) => (
        <Button
          key={mode}
          size="sm"
          variant={value === mode ? "default" : "ghost"}
          onClick={() => onChange(mode as AnalyticsMode)}
          className="rounded-lg capitalize"
        >
          {mode}
        </Button>
      ))}
    </div>
  );
}
