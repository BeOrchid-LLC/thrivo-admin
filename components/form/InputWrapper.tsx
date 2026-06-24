import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface InputWrapperProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  subtext?: React.ReactNode;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function InputWrapper({
  label,
  htmlFor,
  required,
  subtext,
  error,
  className,
  children,
}: InputWrapperProps) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      {(label || subtext) && (
        <div className="flex items-center justify-between gap-2">
          {label ? (
            <Label htmlFor={htmlFor}>
              {label}
              {required ? (
                <span className="text-destructive" aria-hidden>
                  *
                </span>
              ) : null}
            </Label>
          ) : (
            <span />
          )}
          {subtext ? <span className="text-xs text-muted-foreground">{subtext}</span> : null}
        </div>
      )}
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
