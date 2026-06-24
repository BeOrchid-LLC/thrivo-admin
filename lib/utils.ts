import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names + dedupe Tailwind utilities (shadcn convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Count leading occurrences of `char` (used for JSON metadata indentation). */
export function countStartingChar(value: string, char: string) {
  let count = 0;
  for (const c of value) {
    if (c !== char) break;
    count += 1;
  }
  return count;
}
