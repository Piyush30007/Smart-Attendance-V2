export function getErrorMessage(error) {
  // Backend returned an error
  const detail = error.response?.data?.detail;

  // FastAPI validation errors
  if (Array.isArray(detail)) {
    return detail.map(err => err.msg).join(", ");
  }

  // Backend custom message
  if (typeof detail === "string") {
    return detail;
  }

  // Network error
  if (error.code === "ERR_NETWORK") {
    return "Cannot connect to the server. Please check your internet connection or try again later.";
  }

  // Timeout
  if (error.code === "ECONNABORTED") {
    return "The server took too long to respond.";
  }

  // 401 Unauthorized
  if (error.response?.status === 401) {
    return "Your session has expired. Please log in again.";
  }

  // 403 Forbidden
  if (error.response?.status === 403) {
    return "You don't have permission to perform this action.";
  }

  // 404 Not Found
  if (error.response?.status === 404) {
    return "Requested resource was not found.";
  }

  // 500 Internal Server Error
  if (error.response?.status >= 500) {
    return "A server error occurred. Please try again later.";
  }

  return error.message || "An unexpected error occurred.";
}