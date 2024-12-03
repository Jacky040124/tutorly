import { describe, test, expect } from 'vitest'
import { 
  normalizeToMidnight, 
  getWeekBounds, 
  calculateSelectedDate,
  formatTime 
} from "../src/lib/utils/timeUtils"

describe('timeUtils', () => {
  test('normalizeToMidnight should set time to midnight', () => {
    const date = new Date(2024, 0, 1, 14, 30) // Jan 1, 2024, 14:30
    const normalized = normalizeToMidnight(date)
    
    expect(normalized.getHours()).toBe(0)
    expect(normalized.getMinutes()).toBe(0)
    expect(normalized.getSeconds()).toBe(0)
    expect(normalized.getMilliseconds()).toBe(0)
  })

  test('getWeekBounds should return correct monday and sunday', () => {
    const weekOffset = 0 // Current week
    const bounds = getWeekBounds(weekOffset)
    
    expect(bounds).toHaveProperty('monday')
    expect(bounds).toHaveProperty('sunday')
    expect(bounds.monday.day).toBeDefined()
    expect(bounds.sunday.day).toBeDefined()
  })

  test('calculateSelectedDate should return correct date object', () => {
    const day = 1 // Monday
    const weekOffset = 0
    const result = calculateSelectedDate(day, weekOffset)
    
    expect(result).toHaveProperty('year')
    expect(result).toHaveProperty('month')
    expect(result).toHaveProperty('day')
  })

  test('formatTime should format hour correctly', () => {
    expect(formatTime(9)).toBe('9:00 AM')
    expect(formatTime(13)).toBe('1:00 PM')
    expect(formatTime(0)).toBe('12:00 AM')
    expect(formatTime(12)).toBe('12:00 PM')
  })

  test('formatTime should handle decimal hours', () => {
    expect(formatTime(9.5)).toBe('9:30 AM')
    expect(formatTime(13.5)).toBe('1:30 PM')
  })

  test('getWeekBounds should handle different week offsets', () => {
    const nextWeek = getWeekBounds(1)
    const prevWeek = getWeekBounds(-1)
    
    expect(nextWeek).toHaveProperty('monday')
    expect(nextWeek).toHaveProperty('sunday')
    expect(prevWeek).toHaveProperty('monday')
    expect(prevWeek).toHaveProperty('sunday')
  })
}) 