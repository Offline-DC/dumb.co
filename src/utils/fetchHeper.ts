export type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  credentials?: RequestCredentials;
};

export async function apiFetch<T>(
  url: string,
  options: FetchOptions = {},
): Promise<T> {
  const { method = "GET", headers = {}, body, credentials } = options;

  const response = await fetch(url, {
    method,
    credentials,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type");

  let data: unknown;
  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new Error(
      typeof data === "string"
        ? data
        : (data as any)?.message || "Request failed",
    );
  }

  return data as T;
}
