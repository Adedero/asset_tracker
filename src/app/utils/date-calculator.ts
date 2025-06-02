/**
 * Creates a new date by adding a specified amount of time to today's date
 * @param {number} amount - The number of time units to add (can be negative for past dates)
 * @param {string} timeFrame - The time unit ('seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years')
 * @param {Date} [baseDate=new Date()] - Optional base date (defaults to current date/time)
 * @returns {Date} New date object with the time added
 * @throws {Error} If invalid parameters are provided
 *
 * @example
 * // Get date 5 days from now
 * const future = createDateFromToday(5, 'days');
 *
 * // Get date 2 weeks ago
 * const past = createDateFromToday(-2, 'weeks');
 *
 * // Get date 3 months from a specific date
 * const custom = createDateFromToday(3, 'months', new Date('2024-01-01'));
 */
export function createDateFromToday(amount: number, timeFrame: string, baseDate = new Date()) {
  // Input validation
  if (typeof amount !== "number" || isNaN(amount)) {
    throw new Error("Amount must be a valid number");
  }

  if (typeof timeFrame !== "string") {
    throw new Error("Time frame must be a string");
  }

  if (!(baseDate instanceof Date) || isNaN(baseDate.getTime())) {
    throw new Error("Base date must be a valid Date object");
  }

  // Create a new date object to avoid mutating the original
  const resultDate = new Date(baseDate.getTime());

  // Normalize timeFrame to lowercase and handle plurals
  const normalizedTimeFrame = timeFrame.toLowerCase().replace(/s$/, "");

  // Time calculations in milliseconds
  const timeUnits = {
    second: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000
  };

  switch (normalizedTimeFrame) {
    case "second":
    case "minute":
    case "hour":
    case "day":
    case "week":
      resultDate.setTime(resultDate.getTime() + amount * timeUnits[normalizedTimeFrame]);
      break;

    case "month":
      resultDate.setMonth(resultDate.getMonth() + amount);
      break;

    case "year":
      resultDate.setFullYear(resultDate.getFullYear() + amount);
      break;

    default:
      throw new Error(
        `Unsupported time frame: ${timeFrame}. Supported: seconds, minutes, hours, days, weeks, months, years`
      );
  }

  return resultDate;
}

/**
 * Calculates the difference between two dates and returns the most appropriate time unit
 * @param {Date} targetDate - The date to compare
 * @param {Date} [baseDate=new Date()] - The base date to compare from (defaults to now)
 * @param {string} [preferredUnit] - Optional preferred unit to force ('seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years')
 * @returns {Object} Object with amount, timeFrame, and isInPast properties
 * @throws {Error} If invalid dates are provided
 *
 * @example
 * // Calculate difference from now
 * const diff = calculateDateDifference(new Date('2024-12-25'));
 * // Returns: { amount: 25, timeFrame: 'days', isInPast: false }
 *
 * // Force specific unit
 * const hours = calculateDateDifference(futureDate, new Date(), 'hours');
 */
function calculateDateDifference(
  targetDate: Date,
  baseDate = new Date(),
  preferredUnit: string | null = null
) {
  // Input validation
  if (!(targetDate instanceof Date) || isNaN(targetDate.getTime())) {
    throw new Error("Target date must be a valid Date object");
  }

  if (!(baseDate instanceof Date) || isNaN(baseDate.getTime())) {
    throw new Error("Base date must be a valid Date object");
  }

  const diffInMs = targetDate.getTime() - baseDate.getTime();
  const isInPast = diffInMs < 0;
  const absDiffInMs = Math.abs(diffInMs);

  // If a preferred unit is specified, calculate in that unit
  if (preferredUnit) {
    const normalizedUnit = preferredUnit.toLowerCase().replace(/s$/, "");
    let amount;

    switch (normalizedUnit) {
      case "second":
        amount = Math.round(absDiffInMs / 1000);
        break;
      case "minute":
        amount = Math.round(absDiffInMs / (60 * 1000));
        break;
      case "hour":
        amount = Math.round(absDiffInMs / (60 * 60 * 1000));
        break;
      case "day":
        amount = Math.round(absDiffInMs / (24 * 60 * 60 * 1000));
        break;
      case "week":
        amount = Math.round(absDiffInMs / (7 * 24 * 60 * 60 * 1000));
        break;
      case "month":
        // More accurate month calculation
        const yearDiff = targetDate.getFullYear() - baseDate.getFullYear();
        const monthDiff = targetDate.getMonth() - baseDate.getMonth();
        amount = Math.abs(yearDiff * 12 + monthDiff);
        break;
      case "year":
        amount = Math.abs(targetDate.getFullYear() - baseDate.getFullYear());
        break;
      default:
        throw new Error(`Unsupported preferred unit: ${preferredUnit}`);
    }

    return {
      amount: isInPast ? -amount : amount,
      timeFrame: amount === 1 ? normalizedUnit : normalizedUnit + "s",
      isInPast,
      exact: false
    };
  }

  // Auto-detect the most appropriate unit
  const seconds = absDiffInMs / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  const weeks = days / 7;

  // Calculate months and years more accurately
  const yearDiff = Math.abs(targetDate.getFullYear() - baseDate.getFullYear());
  const monthDiff = Math.abs(
    (targetDate.getFullYear() - baseDate.getFullYear()) * 12 +
      (targetDate.getMonth() - baseDate.getMonth())
  );

  let amount, timeFrame;

  // Choose the most appropriate unit based on magnitude
  if (yearDiff >= 1 && days >= 300) {
    amount = Math.round(yearDiff);
    timeFrame = amount === 1 ? "year" : "years";
  } else if (monthDiff >= 1 && days >= 25) {
    amount = Math.round(monthDiff);
    timeFrame = amount === 1 ? "month" : "months";
  } else if (weeks >= 1 && days >= 7) {
    amount = Math.round(weeks);
    timeFrame = amount === 1 ? "week" : "weeks";
  } else if (days >= 1) {
    amount = Math.round(days);
    timeFrame = amount === 1 ? "day" : "days";
  } else if (hours >= 1) {
    amount = Math.round(hours);
    timeFrame = amount === 1 ? "hour" : "hours";
  } else if (minutes >= 1) {
    amount = Math.round(minutes);
    timeFrame = amount === 1 ? "minute" : "minutes";
  } else {
    amount = Math.round(seconds);
    timeFrame = amount === 1 ? "second" : "seconds";
  }

  return {
    amount: isInPast ? -amount : amount,
    timeFrame,
    isInPast,
    exact: true
  };
}

// Helper function for more readable usage
export const DateCalculator = {
  /**
   * Adds time to today's date
   * @param {number} amount
   * @param {string} timeFrame
   * @returns {Date}
   */
  fromNow: (amount: number, timeFrame: string) => createDateFromToday(amount, timeFrame),

  /**
   * Subtracts time from today's date
   * @param {number} amount
   * @param {string} timeFrame
   * @returns {Date}
   */
  ago: (amount: number, timeFrame: string) => createDateFromToday(-amount, timeFrame),

  /**
   * Adds time to a specific date
   * @param {number} amount
   * @param {string} timeFrame
   * @param {Date} baseDate
   * @returns {Date}
   */
  from: (amount: number, timeFrame: string, baseDate: Date) =>
    createDateFromToday(amount, timeFrame, baseDate),

  /**
   * Calculates how much time between now and target date
   * @param {Date} targetDate
   * @param {string} [preferredUnit] - Optional unit to force the calculation
   * @returns {Object}
   */
  until: (targetDate: Date, preferredUnit: string | null = null) =>
    calculateDateDifference(targetDate, new Date(), preferredUnit),

  /**
   * Calculates how much time has passed since a date
   * @param {Date} pastDate
   * @param {string} [preferredUnit] - Optional unit to force the calculation
   * @returns {Object}
   */
  since: (pastDate: Date, preferredUnit: string | null = null) =>
    calculateDateDifference(new Date(), pastDate, preferredUnit),

  /**
   * Calculates the difference between any two dates
   * @param {Date} date1
   * @param {Date} date2
   * @param {string} [preferredUnit] - Optional unit to force the calculation
   * @returns {Object}
   */
  between: (date1: Date, date2: Date, preferredUnit: string | null = null) =>
    calculateDateDifference(date1, date2, preferredUnit)
};
