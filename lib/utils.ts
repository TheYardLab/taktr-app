// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind classes with conditional logic.
 * - Uses clsx to conditionally include class names.
 * - Uses tailwind-merge to resolve class conflicts (e.g., "px-2" vs "px-4").
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}