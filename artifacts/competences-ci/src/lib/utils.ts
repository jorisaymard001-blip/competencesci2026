import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | null) {
  if (!dateString) return "Non défini";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-CI', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  } catch (e) {
    return dateString;
  }
}
