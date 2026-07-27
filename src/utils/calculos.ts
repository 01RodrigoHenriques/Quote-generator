import type { ItemOrcamento, Orcamento } from '../types/orcamento';

export function calcularSubtotalItens(itens: ItemOrcamento[]): number {
  return itens.reduce((soma, item) => soma + item.quantidade * item.precoUnitario, 0);
}

export function calcularTotalComMateriais(subtotalItens: number, custoMateriais: number): number {
  return subtotalItens + custoMateriais;
}

export function calcularTotalComMargem(totalBase: number, margemPercentagem: number): number {
  return totalBase * (1 + margemPercentagem / 100);
}

export function calcularTotalFinal(orcamento: Orcamento): number {
  const subtotal = calcularSubtotalItens(orcamento.itens);
  const comMateriais = calcularTotalComMateriais(subtotal, orcamento.custoMateriais);
  return calcularTotalComMargem(comMateriais, orcamento.margemPercentagem);
}
