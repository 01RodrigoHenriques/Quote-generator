import { describe, it, expect, beforeEach } from 'vitest';
import type { Orcamento } from '../types/orcamento';
import {
  guardarOrcamento,
  listarOrcamentos,
  eliminarOrcamento,
  gerarNumeroOrcamento,
} from './localStorage';

const STORAGE_KEY = 'orcamentos';

function criarOrcamentoMock(overrides: Partial<Orcamento> = {}): Orcamento {
  return {
    id: crypto.randomUUID(),
    numero: 'ORC-2026-001',
    dataEmissao: '2026-01-15',
    validadeDias: 30,
    cliente: { nome: 'Cliente Teste', nif: '123456789' },
    empresa: { nome: 'Empresa Teste', nif: '987654321' },
    itens: [],
    custoMateriais: 0,
    margemPercentagem: 0,
    ...overrides,
  };
}

describe('localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('guardarOrcamento', () => {
    it('deve guardar um novo orçamento', () => {
      const orc = criarOrcamentoMock();
      guardarOrcamento(orc);
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe(orc.id);
    });

    it('deve atualizar um orçamento existente', () => {
      const orc = criarOrcamentoMock();
      guardarOrcamento(orc);

      const updated = { ...orc, cliente: { ...orc.cliente, nome: 'Cliente Atualizado' } };
      guardarOrcamento(updated);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].cliente.nome).toBe('Cliente Atualizado');
    });

    it('deve guardar múltiplos orçamentos distintos', () => {
      const orc1 = criarOrcamentoMock({ id: 'id-1', numero: 'ORC-2026-001' });
      const orc2 = criarOrcamentoMock({ id: 'id-2', numero: 'ORC-2026-002' });
      guardarOrcamento(orc1);
      guardarOrcamento(orc2);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      expect(stored).toHaveLength(2);
    });
  });

  describe('listarOrcamentos', () => {
    it('deve retornar array vazio quando não há dados', () => {
      expect(listarOrcamentos()).toEqual([]);
    });

    it('deve retornar todos os orçamentos guardados', () => {
      const orc1 = criarOrcamentoMock({ id: 'id-1', numero: 'ORC-2026-001' });
      const orc2 = criarOrcamentoMock({ id: 'id-2', numero: 'ORC-2026-002' });
      guardarOrcamento(orc1);
      guardarOrcamento(orc2);

      const list = listarOrcamentos();
      expect(list).toHaveLength(2);
      expect(list.map(o => o.id)).toContain('id-1');
      expect(list.map(o => o.id)).toContain('id-2');
    });

    it('deve lidar com localStorage corrupto gracefully', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json{{{');
      expect(listarOrcamentos()).toEqual([]);
    });
  });

  describe('eliminarOrcamento', () => {
    it('deve eliminar um orçamento pelo ID', () => {
      const orc = criarOrcamentoMock({ id: 'to-delete' });
      guardarOrcamento(orc);
      eliminarOrcamento('to-delete');
      expect(listarOrcamentos()).toEqual([]);
    });

    it('não deve afetar outros orçamentos', () => {
      const orc1 = criarOrcamentoMock({ id: 'keep-1', numero: 'ORC-2026-001' });
      const orc2 = criarOrcamentoMock({ id: 'delete', numero: 'ORC-2026-002' });
      const orc3 = criarOrcamentoMock({ id: 'keep-2', numero: 'ORC-2026-003' });
      guardarOrcamento(orc1);
      guardarOrcamento(orc2);
      guardarOrcamento(orc3);

      eliminarOrcamento('delete');
      const list = listarOrcamentos();
      expect(list).toHaveLength(2);
      expect(list.map(o => o.id)).toContain('keep-1');
      expect(list.map(o => o.id)).toContain('keep-2');
    });

    it('não deve lançar erro ao eliminar ID inexistente', () => {
      expect(() => eliminarOrcamento('nonexistent')).not.toThrow();
    });
  });

  describe('gerarNumeroOrcamento', () => {
    it('deve gerar o primeiro número quando não existem orçamentos', () => {
      const year = new Date().getFullYear();
      expect(gerarNumeroOrcamento()).toBe(`ORC-${year}-001`);
    });

    it('deve incrementar o número corretamente', () => {
      const orc1 = criarOrcamentoMock({ numero: `ORC-${new Date().getFullYear()}-001` });
      guardarOrcamento(orc1);
      const next = gerarNumeroOrcamento();
      expect(next).toBe(`ORC-${new Date().getFullYear()}-002`);
    });

    it('deve resetar a contagem para um novo ano', () => {
      const orc = criarOrcamentoMock({ numero: 'ORC-2025-005' });
      guardarOrcamento(orc);
      const year = new Date().getFullYear();
      const next = gerarNumeroOrcamento();
      // Se estamos em 2026, deve começar em 001
      if (year === 2026) {
        expect(next).toBe('ORC-2026-001');
      }
    });

    it('deve encontrar o maior número existente', () => {
      const orc1 = criarOrcamentoMock({ numero: `ORC-${new Date().getFullYear()}-003` });
      const orc2 = criarOrcamentoMock({ numero: `ORC-${new Date().getFullYear()}-007` });
      guardarOrcamento(orc1);
      guardarOrcamento(orc2);
      const next = gerarNumeroOrcamento();
      expect(next).toBe(`ORC-${new Date().getFullYear()}-008`);
    });
  });
});
