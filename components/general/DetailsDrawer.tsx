"use client";

import { useState, type ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MetaContent, MetaFooter, MetaHeader } from "@/components/general/TableRowDetailsDrawer";
import { cn } from "@/lib/utils";

export interface DetailsDrawerFooterHelpers {
  onViewMetadata: () => void;
}

interface DetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  headerExtra?: ReactNode;
  footer?: ReactNode | ((helpers: DetailsDrawerFooterHelpers) => ReactNode);
  metadata?: unknown;
  dataName?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Right-side slide-over for record details. Full-width on mobile, ~28rem on
 * desktop, with a fixed header / scrollable body / optional footer.
 */
export function DetailsDrawer({
  open,
  onOpenChange,
  title,
  description,
  headerExtra,
  footer,
  metadata,
  dataName = "record",
  children,
  className,
}: DetailsDrawerProps) {
  const [showMeta, setShowMeta] = useState(false);
  const hasMetadata = metadata !== undefined && metadata !== null;
  const metaText = hasMetadata ? JSON.stringify(metadata, null, 2) : "";

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setShowMeta(false);
    onOpenChange(nextOpen);
  };

  const resolvedFooter =
    typeof footer === "function" ? footer({ onViewMetadata: () => setShowMeta(true) }) : footer;

  const showFooter = Boolean(resolvedFooter || (showMeta && hasMetadata));

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className={cn("flex h-full w-full gap-0 p-0 sm:max-w-[28rem]", className)}
      >
        <SheetHeader className="gap-3 border-b p-4 pr-12">
          {showMeta && hasMetadata ? (
            <MetaHeader setShowMeta={setShowMeta} name={dataName} />
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <SheetTitle className="text-xl font-bold">{title}</SheetTitle>
                {description ? (
                  <SheetDescription>{description}</SheetDescription>
                ) : (
                  <SheetDescription className="sr-only">Details</SheetDescription>
                )}
              </div>
              {headerExtra}
            </>
          )}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          {showMeta && hasMetadata ? <MetaContent metaText={metaText} /> : children}
        </div>
        {showFooter ? (
          <SheetFooter className="border-t px-4 py-4 sm:justify-between">
            {showMeta && hasMetadata ? <MetaFooter metaText={metaText} /> : resolvedFooter}
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
