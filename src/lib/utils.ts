import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function withBase(path: string) {
  return import.meta.env.BASE_URL.replace(/\/$/, "") + path
}
