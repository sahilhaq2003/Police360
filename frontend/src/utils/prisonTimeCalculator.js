/**
 * Utility functions for calculating prison time from term strings
 */

/**
 * Parse a prison term string and convert it to days
 * @param {string} term - The prison term (e.g., "2 years", "6 months", "365 days", "1 year 3 months")
 * @returns {number} - Number of days
 */
export const parseTermToDays = (term) => {
  if (!term || typeof term !== 'string') return 0;
  
  const termLower = term.toLowerCase().trim();
  let totalDays = 0;
  
  // Regular expressions to match different time units
  const patterns = [
    // Years: "2 years", "1 year", "2y", "2yr"
    { regex: /(\d+)\s*(?:years?|y|yr)/g, multiplier: 365 },
    // Months: "6 months", "1 month", "6m", "6mo"
    { regex: /(\d+)\s*(?:months?|m|mo)/g, multiplier: 30.44 }, // Average days per month
    // Weeks: "4 weeks", "1 week", "4w", "4wk"
    { regex: /(\d+)\s*(?:weeks?|w|wk)/g, multiplier: 7 },
    // Days: "30 days", "1 day", "30d"
    { regex: /(\d+)\s*(?:days?|d)/g, multiplier: 1 }
  ];
  
  patterns.forEach(({ regex, multiplier }) => {
    let match;
    while ((match = regex.exec(termLower)) !== null) {
      const value = parseInt(match[1], 10);
      if (!isNaN(value) && value > 0) {
        totalDays += Math.round(value * multiplier);
      }
    }
    // Reset regex lastIndex for global regex
    regex.lastIndex = 0;
  });
  
  return totalDays;
};

/**
 * Calculate total prison time from arrests array
 * @param {Array} arrests - Array of arrest records
 * @returns {Object} - { totalDays: number, totalYears: number, totalMonths: number, breakdown: Array }
 */
export const calculateTotalPrisonTime = (arrests) => {
  if (!Array.isArray(arrests) || arrests.length === 0) {
    return {
      totalDays: 0,
      totalYears: 0,
      totalMonths: 0,
      breakdown: []
    };
  }
  
  let totalDays = 0;
  const breakdown = [];
  
  arrests.forEach((arrest, index) => {
    if (arrest.term) {
      const days = parseTermToDays(arrest.term);
      if (days > 0) {
        totalDays += days;
        breakdown.push({
          index: index + 1,
          date: arrest.date,
          charge: arrest.charge || 'Unknown Charge',
          term: arrest.term,
          days: days,
          years: Math.floor(days / 365),
          months: Math.floor((days % 365) / 30.44)
        });
      }
    }
  });
  
  const totalYears = Math.floor(totalDays / 365);
  const totalMonths = Math.floor((totalDays % 365) / 30.44);
  const remainingDays = Math.round(totalDays % 30.44);
  
  return {
    totalDays: Math.round(totalDays),
    totalYears,
    totalMonths,
    remainingDays,
    breakdown
  };
};

/**
 * Format prison time for display
 * @param {number} totalDays - Total days
 * @returns {string} - Formatted string (e.g., "2 years, 3 months, 15 days")
 */
export const formatPrisonTime = (totalDays) => {
  if (!totalDays || totalDays <= 0) return "No prison time";
  
  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30.44);
  const days = Math.round(totalDays % 30.44);
  
  const parts = [];
  
  if (years > 0) {
    parts.push(`${years} year${years !== 1 ? 's' : ''}`);
  }
  if (months > 0) {
    parts.push(`${months} month${months !== 1 ? 's' : ''}`);
  }
  if (days > 0) {
    parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  }
  
  return parts.join(', ');
};

/**
 * Calculate time served vs. time remaining
 * @param {Date} arrestDate - Date of arrest
 * @param {number} totalSentenceDays - Total sentence in days
 * @param {Date} releaseDate - Release date (if released)
 * @returns {Object} - { timeServed: number, timeRemaining: number, isComplete: boolean }
 */
export const calculateTimeServed = (arrestDate, totalSentenceDays, releaseDate = null) => {
  if (!arrestDate || !totalSentenceDays) {
    return {
      timeServed: 0,
      timeRemaining: totalSentenceDays || 0,
      isComplete: false
    };
  }
  
  const startDate = new Date(arrestDate);
  const endDate = releaseDate ? new Date(releaseDate) : new Date();
  const timeServedDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  const timeRemaining = Math.max(0, totalSentenceDays - timeServedDays);
  const isComplete = timeRemaining <= 0;
  
  return {
    timeServed: Math.min(timeServedDays, totalSentenceDays),
    timeRemaining,
    isComplete
  };
};
