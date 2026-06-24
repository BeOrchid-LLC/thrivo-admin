import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function useClipboard() {
  const [copiedValue, setCopiedValue] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = (value: string, options?: { showToast?: boolean; clearAfter?: number }) => {
    const fallbackCopy = (text: string) => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.append(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    };

    void (async () => {
      try {
        if (!navigator?.clipboard?.writeText) {
          throw new Error("writeText not supported");
        }
        await navigator.clipboard.writeText(value);
      } catch {
        fallbackCopy(value);
      }

      setCopiedValue(value);

      if (options?.showToast) {
        toast.success("Copied!");
      }

      if (typeof options?.clearAfter === "number") {
        timeoutRef.current = setTimeout(() => setCopiedValue(""), options.clearAfter);
      }
    })();
  };

  useEffect(() => {
    const timeout = timeoutRef.current;
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return { copiedValue, copy };
}
