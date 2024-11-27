export async function withRetry(operation, maxAttempts = 3, delay = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        break;
      }

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, delay * Math.pow(2, attempt - 1))
      );
    }
  }

  throw lastError;
}

function isRetryableError(error) {
  // Define retryable error conditions
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  return (
    error.status && retryableStatusCodes.includes(error.status) ||
    error.message.includes('network') ||
    error.message.includes('timeout')
  );
} 