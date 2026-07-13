import type { FichaFormData } from "./types";

export function validarFichaFormulario(dados: FichaFormData): string | null {
  if (dados.nome.trim().length < 2) {
    return "O nome do personagem deve ter ao menos 2 caracteres.";
  }

  if (dados.nivel < 1 || dados.nivel > 20) {
    return "O nível deve estar entre 1 e 20.";
  }

  const atributos = [
    dados.for_mod,
    dados.des_mod,
    dados.con_mod,
    dados.int_mod,
    dados.sab_mod,
    dados.car_mod,
  ];

  if (atributos.some((v) => v < -5 || v > 20)) {
    return "Atributos devem estar entre -5 e +20.";
  }

  if (dados.pv_max < 0 || dados.pv_atual < 0 || dados.pv_atual > dados.pv_max) {
    return "PV atual não pode exceder o PV máximo.";
  }

  if (dados.pm_max < 0 || dados.pm_atual < 0 || dados.pm_atual > dados.pm_max) {
    return "PM atual não pode exceder o PM máximo.";
  }

  if (dados.defesa < 0) {
    return "Defesa não pode ser negativa.";
  }

  return null;
}
