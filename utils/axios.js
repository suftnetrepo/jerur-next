import axios from 'axios';

const defaultHeaders = {
  "Content-Type": "application/json",
};

export const bzat = async (url, body = null, method = 'GET', queryParams = null, _headers = {}) => {
  try {
    // Merge default headers with custom headers
    const headers = { ...defaultHeaders, ..._headers };

    // Remove Content-Type if FormData is used
    if (body instanceof FormData) {
      delete headers["Content-Type"];
    }

    // Build request config
    const config = {
      url,
      method,
      headers,
      withCredentials: true, // Include cookies in cross-origin requests
    };

    // Handle query parameters
    if (queryParams && (method === "GET" || method === "DELETE" || method === "PUT")) {
      config.params = queryParams; // Axios handles URLSearchParams automatically
    }

    // Set body (data in Axios)
    if (body) {
      config.data = body; // Axios automatically handles FormData and JSON
    }

    // Perform the request
    const response = await axios(config);

    // Handle DELETE separately if required
    const results = method === "DELETE" ? true : response.data;

    // Return success result
    return {
      success: true,
      data: results?.data || results,
      totalCount: results?.totalCount
    };
  } catch (error) {
    // Handle Axios errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if ([400, 401, 403].includes(status)) {
        return { 
          success: false, 
          status, 
          errorMessage: data.error || data 
        };
      }

      return { 
        success: false, 
        status,
        errorMessage: `Network response was not ok: ${error.response.statusText}` 
      };
    }

    // Network error or other issue
    return { 
      success: false, 
      status: 500, 
      errorMessage: error.message 
    };
  }
};