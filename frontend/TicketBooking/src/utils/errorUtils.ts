import { AxiosError } from "axios";

/**
 * Extracts a human-readable error message from an unknown error.
 * Works with AxiosError (reads response.data.message) and plain Error objects.
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message || error.message || "An error occurred"
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};
