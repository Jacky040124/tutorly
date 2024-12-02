export class Logger {
  constructor(componentName) {
    this.componentName = componentName;
  }

  formatMessage(level, message, data = {}) {
    return {
      timestamp: new Date().toISOString(),
      component: this.componentName,
      level,
      message,
      data
    };
  }

  debug(message, data) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('DEBUG', message, data));
    }
  }

  info(message, data) {
    console.info(this.formatMessage('INFO', message, data));
  }

  warn(message, data) {
    console.warn(this.formatMessage('WARN', message, data));
  }

  error(message, error, data = {}) {
    const errorData = {
      ...data,
      errorMessage: error?.message,
      stack: error?.stack
    };
    console.error(this.formatMessage('ERROR', message, errorData));
  }
}
