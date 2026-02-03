import { useEffect, useRef } from 'react';

interface UsePollingOptions {
  interval?: number; // milliseconds
  enabled?: boolean; // whether polling is active
  onWindowBlur?: boolean; // continue polling when window is blurred
}

/**
 * Generic polling hook that calls a function at regular intervals
 * Automatically stops when window is blurred (unless configured otherwise)
 */
export function usePolling(
  callback: () => void | Promise<void>,
  options: UsePollingOptions = {}
) {
  const {
    interval = 5000, // 5 seconds default
    enabled = true,
    onWindowBlur = false,
  } = options;

  const callbackRef = useRef(callback);
  const isWindowFocusedRef = useRef(true);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Track window focus state
  useEffect(() => {
    const handleFocus = () => {
      isWindowFocusedRef.current = true;
    };

    const handleBlur = () => {
      isWindowFocusedRef.current = false;
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Polling effect
  useEffect(() => {
    if (!enabled) return;

    const poll = async () => {
      // Skip polling if window is blurred and onWindowBlur is false
      if (!onWindowBlur && !isWindowFocusedRef.current) {
        return;
      }

      try {
        await callbackRef.current();
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Execute immediately on mount if enabled
    poll();

    // Then set up interval
    const intervalId = setInterval(poll, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [interval, enabled, onWindowBlur]);
}
