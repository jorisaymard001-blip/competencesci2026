export const apiOrigin = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/+$/, "");

const appBasePath = (import.meta.env.BASE_URL ?? "/").replace(/\/+$/, "");

export function apiUrl(path = ""): string {
  const root = apiOrigin
    ? `${apiOrigin}/api`
    : `${appBasePath}/api`;
  const suffix = path ? `/${path.replace(/^\/+/, "")}` : "";
  return `${root}${suffix}`;
}