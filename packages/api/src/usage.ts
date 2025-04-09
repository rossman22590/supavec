/**
 * Calculates the start date for API usage based on the last usage reset date.
 * If no reset date is provided, it defaults to the beginning of the current month.
 * 
 * @param lastUsageResetAt - ISO string date of the last usage reset
 * @returns Date object representing the start date for API usage tracking
 */
export function getStartDateForApiUsage(lastUsageResetAt: string | null): Date {
    // If there's a last reset date, use that
    if (lastUsageResetAt) {
      return new Date(lastUsageResetAt);
    }
    
    // Otherwise, default to the beginning of the current month
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  
