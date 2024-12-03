import { describe, test, expect } from 'vitest'
import { 
  WEEKDAY_LABELS, 
  generateWeekDates, 
  getRepeatingDates 
} from "@/lib/utils/dateUtils"

describe('dateUtils', () => {
  // Test WEEKDAY_LABELS constants
  test('WEEKDAY_LABELS should have correct values', () => {
    expect(WEEKDAY_LABELS.full).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
    expect(WEEKDAY_LABELS.mobile).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S'])
  })

  // Test generateWeekDates
  test('generateWeekDates should generate correct dates for a week', () => {
    // Create a Monday date for testing
    const mondayDate = new Date(2024, 0, 1) // January 1, 2024 is a Monday
    const weekDates = generateWeekDates(mondayDate)

    // Check if array has 7 days
    expect(weekDates).toHaveLength(7)

    // Check first date (Monday)
    expect(weekDates[0]).toEqual({
      date: 1,
      isToday: expect.any(Boolean)
    })

    // Check last date (Sunday)
    expect(weekDates[6]).toEqual({
      date: 7,
      isToday: expect.any(Boolean)
    })
  })

  // Test getRepeatingDates
  test('getRepeatingDates should generate correct repeating dates', () => {
    const baseDate = {
      year: 2024,
      month: 1, // January
      day: 1
    }

    const repeatingDates = getRepeatingDates(baseDate)

    // Should generate up to 4 dates
    expect(repeatingDates.length).toBeLessThanOrEqual(4)

    // Check first date
    expect(repeatingDates[0]).toEqual({
      year: 2024,
      month: 1,
      day: 1
    })

    // Check second date (should be 7 days later)
    expect(repeatingDates[1]).toEqual({
      year: 2024,
      month: 1,
      day: 8
    })
  })

  // Test getRepeatingDates with month boundary
  test('getRepeatingDates should handle month boundaries', () => {
    const baseDate = {
      year: 2024,
      month: 1, // January
      day: 25  // Near month end
    }

    const repeatingDates = getRepeatingDates(baseDate)

    // Should stop at month boundary
    expect(repeatingDates.every(date => date.month === 1)).toBe(true)
  })
}) 