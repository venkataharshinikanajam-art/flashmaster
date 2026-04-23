// The base URL of the backend. In production (Vercel) we set VITE_API_URL.
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Read the JWT token from the browser's localStorage.
function getToken() {
  return localStorage.getItem("flashmaster_token");
}

// Save or clear the JWT token.
export function setToken(token) {
  if (token) {
    localStorage.setItem("flashmaster_token", token);
  } else {
    localStorage.removeItem("flashmaster_token");
  }
}

// Try to JSON-parse a string. If it is not JSON, return it as-is.
function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

// The core request function. All api.get / api.post etc. call this.
async function request(path, options) {
  if (!options) options = {};
  const method = options.method || "GET";
  const body = options.body;
  const isFormData = options.isFormData === true;

  // Build the headers.
  const headers = {};
  if (!isFormData && body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  // Build the fetch options.
  const fetchOptions = {
    method: method,
    headers: headers,
  };
  if (body !== undefined) {
    if (isFormData) {
      fetchOptions.body = body;
    } else {
      fetchOptions.body = JSON.stringify(body);
    }
  }

  const res = await fetch(BASE + path, fetchOptions);
  const text = await res.text();
  const data = text ? safeParse(text) : null;

  if (!res.ok) {
    let message = "HTTP " + res.status;
    if (data && data.error) message = data.error;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// Shorthand helpers for each HTTP verb.
export const api = {
  get: function (path) {
    return request(path);
  },
  post: function (path, body) {
    return request(path, { method: "POST", body: body });
  },
  patch: function (path, body) {
    return request(path, { method: "PATCH", body: body });
  },
  del: function (path) {
    return request(path, { method: "DELETE" });
  },
  upload: function (path, formData) {
    return request(path, {
      method: "POST",
      body: formData,
      isFormData: true,
    });
  },
};
