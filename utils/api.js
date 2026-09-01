const defaultHeaders = {
  "Content-Type": "application/json",
};

export const zat = async (url, body, method, queryParams = null) => {
  try {
    const headers = { ...defaultHeaders };

    // Remove Content-Type if FormData is used
    if (body instanceof FormData) {
      delete headers["Content-Type"];
    }

    // Request options
    const requestOptions = {
      method,
      headers,
      credentials: "include", // Include cookies in cross-origin requests
    };

    // Handle query parameters
    if (queryParams && (method === "GET" || method === "DELETE" || method === "PUT")) {
      const params = new URLSearchParams(queryParams);
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}${params.toString()}`;
    }

    // Set body
    if (body) {
      requestOptions.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    // Perform the fetch
    const response = await fetch(url, requestOptions);

    // Handle non-OK responses
    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.json();
      } catch {
        // Some upstream failures return an empty or non-JSON response.
      }

      return {
        success: false,
        status: response.status,
        errorMessage: errorData?.error || errorData?.message || response.statusText || `Request failed (${response.status})`
      };
    }

    // Parse the response JSON
    const json = await response.json();

    if (method === "DELETE") {
      return {
        success: true,
        data: true
      };
    }

    // Preserve the full response payload for callers that need metadata,
    // while keeping the existing `data` and `totalCount` contract intact.
    return {
      success: true,
      ...json,
      data: json?.data || json,
      totalCount: json?.totalCount
    };
  } catch (error) {
    // Return error result
    return { success: false, status: 500, errorMessage: error.message };
  }
};
