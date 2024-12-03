import { describe, test, expect } from 'vitest'
import { Logger } from "../../lib/utils/loggerUtil";

describe('loggerUtil', () => {
  test('Logger should create instance with correct component name', () => {
    const logger = new Logger('TestContext')
    expect(logger.componentName).toBe('TestContext')
  })

  test('formatMessage should format message correctly', () => {
    const logger = new Logger('TestContext')
    const result = logger.formatMessage('INFO', 'Test message', { data: 'test' })
    
    expect(result).toEqual({
      timestamp: expect.any(String),
      component: 'TestContext',
      level: 'INFO',
      message: 'Test message',
      data: { data: 'test' }
    })
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
    
    logger.error('Error occurred', error, { data: 'test' })
    
    expect(consoleSpy).toHaveBeenCalledWith({
      timestamp: expect.any(String),
      component: 'TestContext',
      level: 'ERROR',
      message: 'Error occurred',
      data: {
        data: 'test',
        errorMessage: 'Test error',
        stack: expect.any(String)
      }
    })
    
    consoleSpy.mockRestore()
  })

  test('info method should format message correctly', () => {
    const logger = new Logger('TestContext')
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    
    logger.info('Info message', { data: 'test' })
    
    expect(consoleSpy).toHaveBeenCalledWith({
      timestamp: expect.any(String),
      component: 'TestContext',
      level: 'INFO',
      message: 'Info message',
      data: { data: 'test' }
    })
    
    consoleSpy.mockRestore()
  })

  test('warn method should format message correctly', () => {
    const logger = new Logger('TestContext')
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    logger.warn('Warning message', { data: 'test' })
    
    expect(consoleSpy).toHaveBeenCalledWith({
      timestamp: expect.any(String),
      component: 'TestContext',
      level: 'WARN',
      message: 'Warning message',
      data: { data: 'test' }
    })
    
    consoleSpy.mockRestore()
  })
}) 