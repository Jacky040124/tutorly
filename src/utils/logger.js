export class Logger {
  static async logError(error, context = {}) {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });

    // You could add external error tracking here
    // Example with Sentry:
    // Sentry.captureException(error, { extra: context });
  }
} 