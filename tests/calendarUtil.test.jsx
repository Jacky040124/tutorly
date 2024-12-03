import { describe, test, expect } from 'vitest'
import { CALENDAR_CONFIG, calculateGridPosition } from "@/lib/utils/calendarUtil";

describe('calendarUtil', () => {
  // Test CALENDAR_CONFIG constants
  test('CALENDAR_CONFIG should have correct values', () => {
    expect(CALENDAR_CONFIG.START_HOUR).toBe(6)
    expect(CALENDAR_CONFIG.END_HOUR).toBe(24)
    expect(CALENDAR_CONFIG.HOURS_TO_DISPLAY).toBe(18)
    expect(CALENDAR_CONFIG.INTERVALS_PER_HOUR).toBe(12)
  })

  // Test calculateGridPosition.startRow
  test('calculateGridPosition.startRow should calculate correct row', () => {
    // For 9 AM (hour 9)
    const row9AM = calculateGridPosition.startRow(9)
    // Expected: (9 - START_HOUR(6)) * INTERVALS_PER_HOUR(12) + HEADER_OFFSET(2)
    expect(row9AM).toBe(38) // (9-6)*12 + 2 = 38

    // For 12 PM (hour 12)
    const row12PM = calculateGridPosition.startRow(12)
    expect(row12PM).toBe(74) // (12-6)*12 + 2 = 74
  })

  // Test calculateGridPosition.duration
  test('calculateGridPosition.duration should calculate correct duration', () => {
    // 1 hour duration (9AM to 10AM)
    const oneHourDuration = calculateGridPosition.duration(9, 10)
    expect(oneHourDuration).toBe(12) // 1 hour * 12 intervals

    // 2 hour duration (9AM to 11AM)
    const twoHourDuration = calculateGridPosition.duration(9, 11)
    expect(twoHourDuration).toBe(24) // 2 hours * 12 intervals
  })
})
