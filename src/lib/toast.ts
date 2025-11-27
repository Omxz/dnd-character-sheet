// Toast notification utilities using Sonner
import { toast as sonnerToast } from "sonner";

/**
 * Show a success toast notification
 */
export function success(message: string, description?: string) {
  sonnerToast.success(message, {
    description,
    duration: 4000,
  });
}

/**
 * Show an error toast notification
 */
export function error(message: string, description?: string) {
  sonnerToast.error(message, {
    description,
    duration: 5000,
  });
}

/**
 * Show an info toast notification
 */
export function info(message: string, description?: string) {
  sonnerToast.info(message, {
    description,
    duration: 4000,
  });
}

/**
 * Show a warning toast notification
 */
export function warning(message: string, description?: string) {
  sonnerToast.warning(message, {
    description,
    duration: 4000,
  });
}

/**
 * Show a loading toast notification
 * Returns a promise that resolves to the toast ID for updating/dismissing
 */
export function loading(message: string) {
  return sonnerToast.loading(message);
}

/**
 * Dismiss a specific toast by ID
 */
export function dismiss(toastId?: string | number) {
  sonnerToast.dismiss(toastId);
}

/**
 * Promise-based toast that shows loading, then success/error
 */
export function promise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  }
) {
  return sonnerToast.promise(promise, messages);
}

// Export all toast methods in a namespace for convenience
export const toast = {
  success,
  error,
  info,
  warning,
  loading,
  dismiss,
  promise,
};
