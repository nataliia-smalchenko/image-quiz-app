const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function publicFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Помилка запиту");
  }

  return res.json();
}
