import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extract clean display name from technical vinyl color names
 * Example: "SW900-517-O Pool Party Pink" → "Pool Party Pink"
 */
export function getCleanColorName(technicalName: string): string {
  // Pattern: SW900-XXX-X Color Name → Color Name
  const averyPattern = /^SW\d+-\d+-[A-Z]\s+(.+)$/;
  const averyMatch = technicalName.match(averyPattern);
  if (averyMatch) {
    return averyMatch[1];
  }
  
  // Pattern: 2080-XXX Color Name → Color Name
  const threeMPattern = /^2080-[A-Z0-9]+\s+(.+)$/;
  const threeMMatch = technicalName.match(threeMPattern);
  if (threeMMatch) {
    return threeMMatch[1];
  }
  
  // If no pattern matches, return original name
  return technicalName;
}

/**
 * Extract product code from technical vinyl color names
 * Example: "SW900-517-O Pool Party Pink" → "SW900-517-O"
 */
export function getProductCode(technicalName: string): string | null {
  // Pattern: SW900-XXX-X
  const averyPattern = /^(SW\d+-\d+-[A-Z])\s+.+$/;
  const averyMatch = technicalName.match(averyPattern);
  if (averyMatch) {
    return averyMatch[1];
  }
  
  // Pattern: 2080-XXX
  const threeMPattern = /^(2080-[A-Z0-9]+)\s+.+$/;
  const threeMMatch = technicalName.match(threeMPattern);
  if (threeMMatch) {
    return threeMMatch[1];
  }
  
  return null;
}
