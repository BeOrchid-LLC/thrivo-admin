"use client";

import { type ComponentType, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { ArrowLeft, Check, Copy, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/lib/hooks/useClipboard";
import { countStartingChar } from "@/lib/utils";
import { ActionsMenu } from "./ActionsMenu";

export interface TableRowDetailsFooterOption {
  label: string;
  icon?: ComponentType<{ className?: string }>;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "destructive";
}

interface TableRowDetailsFooterProps {
  options?: TableRowDetailsFooterOption[];
  actionsMenu?: ReactNode;
  children?: ReactNode;
  hasMetadata?: boolean;
  onViewMetadata?: () => void;
}

export function MetaHeader({
  setShowMeta,
  name = "record",
}: {
  setShowMeta: Dispatch<SetStateAction<boolean>>;
  name?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setShowMeta(false)}
        aria-label="Back to details"
      >
        <ArrowLeft className="size-4" />
      </Button>
      <div className="grid gap-1">
        <h2 className="text-lg font-semibold text-foreground">Meta Data</h2>
        <p className="text-sm text-muted-foreground">View and copy meta data of this {name}</p>
      </div>
    </div>
  );
}

export function MetaContent({ metaText }: { metaText: string }) {
  return (
    <div className="rounded-2xl bg-muted/50 px-6 py-4">
      <div className="font-mono text-sm font-medium text-foreground/80">
        {metaText.split("\n").map((text, idx) => {
          const paddingLeft = countStartingChar(text, " ") * 8;
          return (
            <p key={idx} className="break-all" style={{ paddingLeft }}>
              {text}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export function MetaFooter({ metaText }: { metaText: string }) {
  const { copy, copiedValue } = useClipboard();
  const Icon = copiedValue === metaText ? Check : Copy;

  return (
    <div className="flex w-full justify-end">
      <Button type="button" variant="outline" onClick={() => copy(metaText, { showToast: true })}>
        Copy Meta Data
        <Icon className="size-4 text-primary" />
      </Button>
    </div>
  );
}

/** Drawer footer: actions menu on the left, optional center slot, metadata on the right. */
export function TableRowDetailsFooter({
  options = [],
  actionsMenu,
  children,
  hasMetadata = false,
  onViewMetadata,
}: TableRowDetailsFooterProps) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="shrink-0">
        {actionsMenu ?? <ActionsMenu options={options} align="start" ariaLabel="More options" />}
      </div>

      <div className="flex flex-1 items-center justify-center">{children}</div>

      <div className="shrink-0">
        {hasMetadata && onViewMetadata ? (
          <Button type="button" variant="outline" onClick={onViewMetadata}>
            <FileText className="size-4" />
            View Metadata
          </Button>
        ) : null}
      </div>
    </div>
  );
}
