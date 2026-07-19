/**
 * Origem pública do app (browser ou servidor).
 * Evita redirects para localhost quando o Site URL do Supabase está errado.
 */
export function obterOrigemDoCliente(): string {
  if (typeof window === "undefined") {
    throw new Error("obterOrigemDoCliente() só pode ser usado no browser.");
  }
  return window.location.origin;
}

/**
 * URL de callback pós-confirmação de e-mail / OAuth.
 * Preferência: NEXT_PUBLIC_SITE_URL (produção) → origin do request → VERCEL_URL.
 */
export function obterUrlSite(headers?: Headers): string {
  const configurada = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configurada) return configurada;

  if (headers) {
    const host = headers.get("x-forwarded-host") ?? headers.get("host");
    const proto = headers.get("x-forwarded-proto") ?? "https";
    if (host) return `${proto}://${host}`;
  }

  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
