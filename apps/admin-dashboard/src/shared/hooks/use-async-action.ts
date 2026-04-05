import { useState, useCallback } from 'react';
import { getErrorMessage } from '@repo/types/guards';

export function useAsyncAction() {
  const [error, setError] = useState('');

  const execute = useCallback(async (fn: () => Promise<void>, fallbackMessage: string) => {
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(getErrorMessage(err, fallbackMessage));
    }
  }, []);

  return { error, execute, clearError: () => setError('') };
}
