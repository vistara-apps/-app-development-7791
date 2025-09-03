import { useState, useCallback } from 'react';

/**
 * A hook for handling asynchronous operations with loading and error states
 * @param {Function} asyncFunction - The async function to execute
 * @param {boolean} immediate - Whether to execute the function immediately
 * @returns {Object} The async state and execute function
 */
export const useAsync = (asyncFunction, immediate = false) => {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  // The execute function wraps the asyncFunction and handles state
  const execute = useCallback(
    async (...params) => {
      setStatus('pending');
      setValue(null);
      setError(null);

      try {
        const response = await asyncFunction(...params);
        setValue(response);
        setStatus('success');
        return response;
      } catch (error) {
        setError(error);
        setStatus('error');
        throw error;
      }
    },
    [asyncFunction]
  );

  // Execute the function immediately if requested
  useState(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    execute,
    status,
    value,
    error,
    isIdle: status === 'idle',
    isPending: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
};

export default useAsync;

