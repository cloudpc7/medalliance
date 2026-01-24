// apiHandler.js

/**
 * apiHandler
 * * A wrapper for API calls that standardizes validation, normalization, 
 * and error handling across the application.
 */
export const apiHandler = ({
  apiName,
  call,
  validate = (result) => {
    if (!result.data?.success) {
      throw new Error(result.data?.message || 'Request failed');
    }
  },
  normalize = (result) => result.data?.data ?? result.data,
  fallbackMessage = 'Something went wrong. Please try again.',
}) => {
  return async (...args) => {
    try {
      const result = await call(...args);
      validate(result);

      return normalize(result);
    } catch (error) {
      
      const code = error?.code;
      const message = error?.message || 'Unkown error';

      if (code === 'unauthenticated' || code === 'auth/user-token-expired') {
        throw new Error(`[${apiName}] Your session has expired. Please sign in again.`);
      }
      
      if (code === 'permission-denied') {
        throw new Error(`[${apiName}] You do not have permission to perform this action.`);
      }
      
      if (code === 'not-found') {
        throw new Error(`[${apiName}] Requested resource not found.`);
      }
      
      if (code === 'invalid-argument') {
        throw new Error(`[${apiName}] Invalid data provided.`);
      }
      
      if (code === 'deadline-exceeded' || code === 'unavailable') {
        throw new Error(`[${apiName}] Server temporarily unavailable. Please try again.`);
      }

      // Fallback for unexpected errors
      throw new Error(`${fallbackMessage} (${apiName})`);
    }
  };
};