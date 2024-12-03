export async function withRetry(operation, maxAttempts = 3, delay = 1000) {
  
    let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (error.status && error.status >= 400 && error.status < 500) {
        throw error;
      }

      if (attempt === maxAttempts) {
        break;
      }

      // Wait before retrying with exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, delay * Math.pow(2, attempt - 1))
      );
    }
  }

  throw lastError;
}

// helper
function isRetryableError(error) {
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  return (
    (error.status && retryableStatusCodes.includes(error.status)) ||
    error.message?.includes("network") ||
    error.code === 'ECONNRESET'
  );
}
