"use client";

import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
  disabled?: boolean;
  className?: string;
}

export function OtpInput({ length = 6, onComplete, disabled, className }: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function focus(index: number) {
    refs.current[index]?.focus();
  }

  function update(index: number, value: string) {
    const next = [...digits];
    next[index] = value;
    setDigits(next);

    if (value && index < length - 1) {
      focus(index + 1);
    }

    if (next.every((d) => d !== "")) {
      onComplete(next.join(""));
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        update(index, "");
      } else if (index > 0) {
        update(index - 1, "");
        focus(index - 1);
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      focus(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      focus(index + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;

    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i] ?? "";
    }
    setDigits(next);

    const lastFilled = Math.min(pasted.length, length - 1);
    focus(lastFilled);

    if (next.every((d) => d !== "")) {
      onComplete(next.join(""));
    }
  }

  return (
    <div className={cn("flex gap-2", className)}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(-1);
            update(i, val);
          }}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-12 w-10 rounded-md border bg-background text-center text-lg font-semibold",
            "ring-offset-background transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            digit ? "border-primary" : "border-input"
          )}
        />
      ))}
    </div>
  );
}
