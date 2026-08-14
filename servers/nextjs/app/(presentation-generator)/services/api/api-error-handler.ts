// API Error Response Interface
// `detail`/`message`/`error` are typed `unknown`, not `string`, on purpose:
// FastAPI's own automatic validation-error responses (422) always send
// `detail` as an ARRAY of {loc, msg, type} objects, never a string. Typing
// these as `string` here hid that mismatch from the compiler while the code
// below passed the array straight into `new Error(...)`, which JS
// stringifies as the literal text "[object Object]" (or
// "[object Object],[object Object]" for more than one) — see
// stringifyErrorDetail below for the fix.
interface ApiErrorResponse {
  detail?: unknown;
  message?: unknown;
  error?: unknown;
}

// Formats whichever shape `detail`/`message`/`error` actually arrives in
// into a human-readable string, instead of relying on JS's implicit
// `String(value)` coercion — which turns a plain object, or an array of
// objects (FastAPI's validation-error shape), into "[object Object]" with
// no indication of what actually failed.
function stringifyErrorDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    // FastAPI/Pydantic validation error shape: [{ loc: [...], msg, type }, ...]
    return detail
      .map((item) => {
        if (item && typeof item === "object") {
          const { loc, msg } = item as { loc?: unknown[]; msg?: unknown };
          const location = Array.isArray(loc) ? loc.join(".") : undefined;
          if (location && typeof msg === "string") return `${location}: ${msg}`;
          if (typeof msg === "string") return msg;
        }
        return typeof item === "string" ? item : JSON.stringify(item);
      })
      .join("; ");
  }

  if (detail && typeof detail === "object") {
    try {
      return JSON.stringify(detail);
    } catch {
      return String(detail);
    }
  }

  return String(detail);
}

// API Response Handler Utility
export class ApiResponseHandler {
 
  static async handleResponse(response: Response, defaultErrorMessage: string): Promise<any> {
    // Handle successful responses
    if (response.ok) {
      // Handle 204 No Content responses
      if (response.status === 204) {
        return true;
      }
      
      // Try to parse JSON response
      try {
        return await response.json();
      } catch (error) {
        // If JSON parsing fails but response is ok, return empty object
        return {};
      }
    }

    // Handle error responses
    let errorMessage = defaultErrorMessage;
    
    try {
      const errorData: ApiErrorResponse = await response.json();
      
      // Extract error message in order of preference
      if (errorData.detail !== undefined && errorData.detail !== null) {
        errorMessage = stringifyErrorDetail(errorData.detail);
      } else if (errorData.message !== undefined && errorData.message !== null) {
        errorMessage = stringifyErrorDetail(errorData.message);
      } else if (errorData.error !== undefined && errorData.error !== null) {
        errorMessage = stringifyErrorDetail(errorData.error);
      }
    } catch (parseError) {
      // If JSON parsing fails, use status-based messages
      errorMessage = this.getStatusBasedErrorMessage(response.status, defaultErrorMessage);
    }

    // Throw error with appropriate message
    throw new Error(errorMessage);
  }


  static async handleResponseWithResult(response: Response, defaultErrorMessage: string): Promise<{success: boolean, message?: string}> {
    try {
      // Handle successful responses
      if (response.ok) {
        return { success: true };
      }

      // Handle error responses
      let errorMessage = defaultErrorMessage;
      
      try {
        const errorData: ApiErrorResponse = await response.json();
        
        // Extract error message in order of preference
        if (errorData.detail !== undefined && errorData.detail !== null) {
          errorMessage = stringifyErrorDetail(errorData.detail);
        } else if (errorData.message !== undefined && errorData.message !== null) {
          errorMessage = stringifyErrorDetail(errorData.message);
        } else if (errorData.error !== undefined && errorData.error !== null) {
          errorMessage = stringifyErrorDetail(errorData.error);
        }
      } catch (parseError) {
        // If JSON parsing fails, use status-based messages
        errorMessage = this.getStatusBasedErrorMessage(response.status, defaultErrorMessage);
      }

      return {
        success: false,
        message: errorMessage,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : defaultErrorMessage,
      };
    }
  }


  private static getStatusBasedErrorMessage(status: number, defaultMessage: string): string {
    switch (status) {
      case 400:
        return "Bad request. Please check your input and try again.";
      case 401:
        return "Unauthorized. Please log in and try again.";
      case 403:
        return "Access forbidden. You don't have permission to perform this action.";
      case 404:
        return "Resource not found. The requested item may have been deleted or moved.";
      case 409:
        return "Conflict. The resource already exists or there's a conflict with the current state.";
      case 422:
        return "Validation error. Please check your input and try again.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
        return "Internal server error. Please try again later.";
      case 502:
        return "Bad gateway. The server is temporarily unavailable.";
      case 503:
        return "Service unavailable. Please try again later.";
      case 504:
        return "Gateway timeout. The request took too long to process.";
      default:
        return defaultMessage;
    }
  }
}

export type { ApiErrorResponse }; 