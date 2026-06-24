"use client";

import { useEffect, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TruncatedCellProps {
  value: string;
  className?: string;
}

/** Truncates with ellipsis; tooltip only when content overflows. */
export function TruncatedCell({ value, className }: TruncatedCellProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflowing(el.scrollWidth > el.clientWidth);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  const content = (
    <span ref={ref} className={cn("block truncate", className)}>
      {value}
    </span>
  );

  if (!overflowing) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent>{value}</TooltipContent>
    </Tooltip>
  );
}
