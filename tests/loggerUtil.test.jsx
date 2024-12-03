import { describe, test, expect } from 'vitest'
import { Logger } from "../src/lib/utils/loggerUtil"

describe('loggerUtil', () => {
    
  test('Logger should create instance with correct context', () => {
    const logger = new Logger('TestContext')
    expect(logger.context).toBe('TestContext')
  })

  

  test('debug method should format message correctly', () => {
    const logger = new Logger('TestContext')
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    
    logger.debug('Test message', { data: 'test' })
    
    expect(consoleSpy).toHaveBeenCalledWith({
      timestamp: expect.any(String),
      component: 'TestContext',
      level: 'DEBUG',
      message: 'Test message',
      data: { data: 'test' }
    })
    
    consoleSpy.mockRestore()
  })

  test('error method should format error correctly', () => {
    const logger = new Logger('TestContext')
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Test error')
    
    logger.error(error, { data: 'test' })
    
    expect(consoleSpy).toHaveBeenCalledWith(
      '[TestContext]',
      error,
      { data: 'test' }
    )
    
    consoleSpy.mockRestore()
  })
}) 