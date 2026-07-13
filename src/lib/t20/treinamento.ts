/** Bônus de treinamento T20: metade do nível, arredondado para baixo. */
export function bonusTreinamento(nivel: number): number {
  return Math.floor(nivel / 2);
}
