// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { getSupabaseClient } from "@/lib/supabase"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats TVL (Total Value Locked) values consistently
 * @param tvl - The TVL value as a string or number
 * @returns Formatted TVL string with proper currency and unit
 */
export function formatTVL(tvl: string | number): string {
  // If tvl is already a formatted string (contains $ or letters)
  if (typeof tvl === 'string' && (tvl.includes('$') || /[a-zA-Z]/.test(tvl))) {
    // Ensure it starts with $
    if (!tvl.includes('$')) {
      tvl = '$' + tvl;
    }
    return tvl;
  }

  // Convert to number if it's a numeric string
  let numValue: number;
  if (typeof tvl === 'string') {
    // Remove any non-numeric characters except decimal point
    const cleanValue = tvl.replace(/[^0-9.]/g, '');
    numValue = parseFloat(cleanValue);
  } else {
    numValue = tvl;
  }

  // Handle NaN
  if (isNaN(numValue)) {
    return '$0M';
  }

  // Format based on size
  if (numValue >= 1_000_000_000) {
    return `$${(numValue / 1_000_000_000).toFixed(1)}B`;
  } else if (numValue >= 1_000_000) {
    return `$${(numValue / 1_000_000).toFixed(1)}M`;
  } else if (numValue >= 1_000) {
    return `$${(numValue / 1_000).toFixed(1)}K`;
  } else {
    return `$${numValue.toFixed(0)}`;
  }
}

/**
 * Gets all unique asset types from projects in the database
 * Useful for backwards compatibility during migration
 * @returns Array of unique asset types
 */
export async function getUniqueAssetTypes(): Promise<string[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("projects")
    .select("type");
    
  if (error) {
    console.error("Error fetching project types:", error);
    return [];
  }
  
  // Extract unique types
  const typeSet = new Set<string>();
  data.forEach(project => {
    if (project.type) {
      typeSet.add(project.type);
    }
  });
  
  return Array.from(typeSet).sort();
}
