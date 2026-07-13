export interface ResultadoRolagem {
  expressao: string;
  resultados: number[];
  modificador: number;
  total: number;
  detalhes: string;
}

const EXPRESSAO_REGEX =
  /^\s*(\d+)\s*d\s*(\d+)(?:\s*([+-])\s*(\d+))?\s*$/i;

/** Rola N dados de M lados + modificador opcional. Ex: "1d20+3", "2d6+2". */
export function rolarExpressao(expressao: string): ResultadoRolagem {
  const normalizada = expressao.trim().toLowerCase().replace(/\s+/g, "");

  const match = normalizada.match(EXPRESSAO_REGEX);
  if (!match) {
    throw new Error(`Expressão inválida: "${expressao}". Use formato como 1d20+3.`);
  }

  const quantidade = Number(match[1]);
  const lados = Number(match[2]);
  const sinal = match[3] ?? "+";
  const modValor = match[4] ? Number(match[4]) : 0;
  const modificador = sinal === "-" ? -modValor : modValor;

  if (quantidade < 1 || quantidade > 20) {
    throw new Error("Quantidade de dados deve ser entre 1 e 20.");
  }
  if (lados < 2 || lados > 100) {
    throw new Error("Número de lados deve ser entre 2 e 100.");
  }

  const resultados: number[] = [];
  for (let i = 0; i < quantidade; i++) {
    resultados.push(rolarUmDado(lados));
  }

  const somaDados = resultados.reduce((a, b) => a + b, 0);
  const total = somaDados + modificador;

  const exprExibicao = `${quantidade}d${lados}${formatarMod(modificador)}`;
  const detalhes =
    quantidade === 1
      ? `[${resultados[0]}]${formatarMod(modificador)} = ${total}`
      : `[${resultados.join(", ")}] = ${somaDados}${formatarMod(modificador)} = ${total}`;

  return {
    expressao: exprExibicao,
    resultados,
    modificador,
    total,
    detalhes,
  };
}

export function rolarD20(modificador: number): ResultadoRolagem {
  const resultado = rolarExpressao(`1d20${formatarMod(modificador)}`);
  return resultado;
}

export function montarExpressaoLivre(
  quantidade: number,
  lados: number,
  modificador: number,
): string {
  return `${quantidade}d${lados}${formatarMod(modificador)}`;
}

function rolarUmDado(lados: number): number {
  return Math.floor(Math.random() * lados) + 1;
}

function formatarMod(valor: number): string {
  if (valor === 0) return "";
  return valor > 0 ? `+${valor}` : `${valor}`;
}

export function formatarModificador(valor: number): string {
  return valor >= 0 ? `+${valor}` : `${valor}`;
}
