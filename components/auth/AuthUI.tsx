"use client";

import { useRef, useState, type ReactNode } from "react";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/ui/otp-input";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Card className="w-full border-border/80 shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer ? <CardFooter className="flex-col gap-3 border-t pt-6">{footer}</CardFooter> : null}
    </Card>
  );
}

export function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
  autoFocus,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  function toggleVisibility() {
    const input = inputRef.current;
    const selectionStart = input?.selectionStart ?? value.length;
    const selectionEnd = input?.selectionEnd ?? value.length;
    const selectionDirection = input?.selectionDirection ?? "none";

    setVisible((current) => !current);

    const restoreFocus = () => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(selectionStart, selectionEnd, selectionDirection);
    };

    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(restoreFocus);
    } else {
      setTimeout(restoreFocus, 0);
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          type={isPassword && visible ? "text" : type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          autoFocus={autoFocus}
          className={isPassword ? "pr-10" : undefined}
          required
        />
        {isPassword ? (
          <button
            type="button"
            aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-50"
            onMouseDown={(event) => event.preventDefault()}
            onClick={toggleVisibility}
            disabled={disabled}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="sr-only">
              {visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function AuthCodeField({
  label = "Verification code",
  description,
  onComplete,
  disabled,
}: {
  label?: string;
  description: string;
  onComplete: (code: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <OtpInput onComplete={onComplete} disabled={disabled} />
    </div>
  );
}

export function AuthAlert({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function AuthSubmitButton({
  children,
  loading,
  disabled,
}: {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <Button type="submit" className="w-full" disabled={disabled || loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {loading ? "Please wait…" : children}
    </Button>
  );
}
