"use client";

import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { TableRowDetailsFooterOption } from "./TableRowDetailsDrawer";

interface ActionsMenuProps {
  options: TableRowDetailsFooterOption[];
  align?: "start" | "end";
  ariaLabel?: string;
}

/** Row / drawer overflow menu for entity actions. Trigger stays visible even when empty. */
export function ActionsMenu({ options, align = "end", ariaLabel }: ActionsMenuProps) {
  const hasOptions = options.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={!hasOptions}
          aria-label={ariaLabel ?? "Open menu"}
          className="size-8"
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      {hasOptions ? (
        <DropdownMenuContent align={align}>
          {options.map((option, index) => {
            const Icon = option.icon;
            return (
              <DropdownMenuItem
                key={index}
                onClick={option.onClick}
                disabled={option.disabled}
                className={cn(
                  option.variant === "destructive" && "text-destructive focus:text-destructive"
                )}
              >
                {Icon ? <Icon className="size-4" /> : null}
                {option.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      ) : null}
    </DropdownMenu>
  );
}
