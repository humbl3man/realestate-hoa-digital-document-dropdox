import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

// No import from next/server to avoid breaking client components

export function getAppUrl(req?: Request) {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  
  if (req) {
    const xForwardedHost = req.headers.get("x-forwarded-host");
    const hostHeader = req.headers.get("host");
    const host = xForwardedHost ? xForwardedHost.split(",")[0].trim() : hostHeader;
    
    const xForwardedProto = req.headers.get("x-forwarded-proto");
    const protocol = xForwardedProto ? xForwardedProto.split(",")[0].trim() : "https";
    
    if (host) {
      return `${protocol}://${host}`;
    }
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
