const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("ativihub_token");
  }
  return null;
};

export const setAuthToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("ativihub_token", token);
  }
};

export const removeAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("ativihub_token");
  }
};

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export const fetchApi = async (endpoint: string, options: FetchOptions = {}) => {
  const { requireAuth = true, headers, ...rest } = options;
  const token = getAuthToken();

  const config: RequestInit = {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (requireAuth && token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  // Artificial delay for GET requests to show off the gamified loading screen
  if (!config.method || config.method.toUpperCase() === "GET") {
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    const text = await response.text().catch(() => "");
    if (text) {
      try {
        const errorData = JSON.parse(text);
        errorMsg = errorData?.message || errorData?.error || errorMsg;
      } catch {
        errorMsg = text;
      }
    }
    throw new Error(errorMsg);
  }

  // Se a resposta for vazia (ex: 204 No Content ou 200 OK sem body)
  const text = await response.text();
  if (!text) return null;

  return JSON.parse(text);
};
