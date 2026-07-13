import type { DiscordEmbedRolagem } from "./types";

function ehWebhookDiscord(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "discord.com" ||
      parsed.hostname === "discordapp.com"
    ) && parsed.pathname.includes("/api/webhooks/");
  } catch {
    return false;
  }
}

export async function enviarRolagemDiscord(
  webhookUrl: string,
  dados: DiscordEmbedRolagem,
): Promise<{ ok: boolean; error?: string }> {
  if (!ehWebhookDiscord(webhookUrl)) {
    return { ok: false, error: "URL do Discord não é um webhook válido." };
  }

  const dadosTexto =
    dados.resultados.length === 1
      ? `1d20 → **[${dados.resultados[0]}]**${formatarMod(dados.modificador)}`
      : `${dados.expressao} → [${dados.resultados.join(", ")}]${formatarMod(dados.modificador)}`;

  const payload = {
    embeds: [
      {
        title: "🎲 Rolagem — Tormenta20",
        color: 0xf4d03f,
        fields: [
          {
            name: "Personagem",
            value: dados.nomePersonagem,
            inline: true,
          },
          {
            name: "Teste",
            value: dados.teste,
            inline: true,
          },
          {
            name: "Dados",
            value: dadosTexto,
            inline: false,
          },
          {
            name: "Resultado Total",
            value: `**${dados.total}**`,
            inline: false,
          },
        ],
        footer: {
          text: "Mesa Tormenta20 · VTT Online",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const texto = await res.text().catch(() => "");
      return {
        ok: false,
        error: `Discord retornou ${res.status}${texto ? `: ${texto.slice(0, 120)}` : ""}`,
      };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Falha ao contactar Discord.",
    };
  }
}

function formatarMod(valor: number): string {
  if (valor === 0) return "";
  return valor > 0 ? ` + ${valor}` : ` ${valor}`;
}
