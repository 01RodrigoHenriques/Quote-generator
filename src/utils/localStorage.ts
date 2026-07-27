import type { Orcamento } from '../types/orcamento';

const STORAGE_KEY = 'orcamentos';

function getStorage(): Orcamento[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function setStorage(orcamentos: Orcamento[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orcamentos));
}

export function guardarOrcamento(orcamento: Orcamento): void {
  const orcamentos = getStorage();
  const index = orcamentos.findIndex(o => o.id === orcamento.id);
  if (index >= 0) {
    orcamentos[index] = orcamento;
  } else {
    orcamentos.push(orcamento);
  }
  setStorage(orcamentos);
}

export function listarOrcamentos(): Orcamento[] {
  return getStorage();
}

export function eliminarOrcamento(id: string): void {
  const orcamentos = getStorage().filter(o => o.id !== id);
  setStorage(orcamentos);
}

export function gerarNumeroOrcamento(): string {
  const orcamentos = getStorage();
  const year = new Date().getFullYear();
  const prefix = `ORC-${year}-`;
  const existingNumbers = orcamentos
    .map(o => o.numero)
    .filter(n => n.startsWith(prefix))
    .map(n => parseInt(n.replace(prefix, ''), 10))
    .filter(n => !isNaN(n));
  const next = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}
