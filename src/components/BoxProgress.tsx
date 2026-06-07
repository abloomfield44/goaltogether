import { cn } from "@/lib/utils";

interface BoxProgressProps {
  value: number;
  max: number;
  color?: string;
  className?: string;
}

export function BoxProgress({ value, max, color = "bg-teal-500", className }: BoxProgressProps) {
  if (max > 40) return null;

  // Determine box sizing based on total amount
  let boxSizeClass = "w-6 h-6";
  let gapClass = "gap-2";

  if (max > 20) {
    boxSizeClass = "w-3 h-3";
    gapClass = "gap-1";
  } else if (max > 10) {
    boxSizeClass = "w-4 h-4";
    gapClass = "gap-1.5";
  }

  const boxes = Array.from({ length: max }, (_, i) => i);

  return (
    <div className={cn(`flex flex-wrap mt-4 ${gapClass}`, className)}>
      {boxes.map((i) => {
        const isFilled = i < value;
        return (
          <div
            key={i}
            className={cn(
              "rounded-sm transition-all duration-500",
              boxSizeClass,
              isFilled ? color : "bg-slate-100 border border-slate-200"
            )}
          />
        );
      })}
    </div>
  );
}
