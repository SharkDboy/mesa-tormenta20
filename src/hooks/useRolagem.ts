"use client";

import { useCallback, useState } from "react";
import { executarRolagem } from "@/lib/rolagens/actions";
import type { ExecutarRolagemInput, RolagemRegistro } from "@/lib/rolagens/types";

export function useRolagem(campanhaId: string) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ultima, setUltima] = useState<RolagemRegistro | null>(null);

  const rolar = useCallback(
    async (input: Omit<ExecutarRolagemInput, "campanhaId">) => {
      setCarregando(true);
      setErro(null);

      try {
        const resultado = await executarRolagem({
          campanhaId,
          ...input,
        });

        if (!resultado.ok || !resultado.data) {
          setErro(resultado.error ?? "Erro na rolagem.");
          return null;
        }

        setUltima(resultado.data);
        return resultado.data;
      } finally {
        setCarregando(false);
      }
    },
    [campanhaId],
  );

  return { rolar, carregando, erro, ultima, setErro };
}

export type RolagemController = ReturnType<typeof useRolagem>;
