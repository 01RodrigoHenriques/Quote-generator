import type { Orcamento } from '../types/orcamento';
import { gerarNumeroOrcamento } from '../utils/localStorage';

export function criarOrcamentoVazio(): Orcamento {
  return {
    id: crypto.randomUUID(),
    numero: gerarNumeroOrcamento(),
    dataEmissao: new Date().toISOString().split('T')[0],
    validadeDias: 30,
    cliente: { nome: '', morada: '', nif: '', email: '' },
    empresa: { nome: '', morada: '', nif: '', telefone: '', email: '' },
    itens: [],
    custoMateriais: 0,
    margemPercentagem: 0,
    notas: '',
  };
}
