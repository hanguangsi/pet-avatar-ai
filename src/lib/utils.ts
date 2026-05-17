import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input?: string | null) {
  if (!input) return "未设置";
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(new Date(input));
}

export function publicUrl(path?: string | null) {
  return path || "/placeholder-pet.svg";
}
