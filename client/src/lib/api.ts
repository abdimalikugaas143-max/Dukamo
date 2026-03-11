// Authenticated fetch wrapper — automatically attaches JWT from localStorage

export function getToken(): string | null {
  return localStorage.getItem('dukamo_token') || localStorage.getItem('ops_token');
}

export function setToken(token: string) {
  localStorage.setItem('dukamo_token', token);
}

export function clearToken() {
  localStorage.removeItem('dukamo_token');
  localStorage.removeItem('dukamo_user');
  localStorage.removeItem('ops_token');
  localStorage.removeItem('ops_user');
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(path, { ...options, headers });
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await apiFetch(path, { method: 'POST', body: JSON.stringify(body) });
  if (!res.ok) {
    const msg = await res.text();
    try { throw new Error(JSON.parse(msg).error); } catch { throw new Error(msg); }
  }
  return res.json();
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await apiFetch(path, { method: 'PUT', body: JSON.stringify(body) });
  if (!res.ok) {
    const msg = await res.text();
    try { throw new Error(JSON.parse(msg).error); } catch { throw new Error(msg); }
  }
  return res.json();
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiDelete(path: string): Promise<void> {
  const res = await apiFetch(path, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
}
