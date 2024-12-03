import { describe, test, expect } from 'vitest'
import { withRetry } from "../../lib/utils/retryUtil"

describe('retryUtil', () => {
  test('should resolve on successful operation', async () => {
    const operation = () => Promise.resolve('success')
    const result = await withRetry(operation)
    expect(result).toBe('success')
  })

  test('should retry on failure and eventually succeed', async () => {
    let attempts = 0
    const operation = () => {
      attempts++
      if (attempts < 2) {
        throw { status: 500 }
      }
      return Promise.resolve('success')
    }

    const result = await withRetry(operation)
    expect(result).toBe('success')
    expect(attempts).toBe(2)
  })

  test('should not retry on non-retryable error', async () => {
    const operation = () => Promise.reject({ status: 400 })
    
    await expect(withRetry(operation)).rejects.toEqual({ status: 400 })
  })

  test('should fail after max retries', async () => {
    let attempts = 0
    const operation = () => {
      attempts++
      throw { status: 500 }
    }

    await expect(withRetry(operation)).rejects.toEqual({ status: 500 })
    expect(attempts).toBe(3) // Assuming max retries is 2
  })
}) 