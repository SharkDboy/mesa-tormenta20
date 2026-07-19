import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { obterUrlSite } from "@/lib/auth/site-url";

/**
 * Troca o code do e-mail/OAuth por sessão.
 * O host vem dos headers da requisição (nunca localhost hardcoded).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const nextRaw = searchParams.get("next") ?? "/dashboard";
  const next = nextRaw.startsWith("/") ? nextRaw : "/dashboard";

  const origin = obterUrlSite(request.headers);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=auth_callback&message=Falha%20na%20confirma%C3%A7%C3%A3o`,
  );
}
