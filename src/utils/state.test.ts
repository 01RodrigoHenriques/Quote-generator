import { describe, it, expect, beforeEach, vi } from 'vitest';
import { criarOrcamentoVazio } from './state';
import * as localStorageUtils from './localStorage';

describe('state', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('criarOrcamentoVazio', () => {
    it('deve criar um orçamento com ID único', () => {
      const orc1 = criarOrcamentoVazio();
      const orc2 = criarOrcamentoVazio();
      expect(orc1.id).toBeDefined();
      expect(orc2.id).toBeDefined();
      expect(orc1.id).not.toBe(orc2.id);
    });

    it('deve gerar um número de orçamento', () => {
      const orc = criarOrcamentoVazio();
      const year = new Date().getFullYear();
      expect(orc.numero).toMatch(new RegExp(`^ORC-${year}-\\d{3}$`));
    });

    it('deve definir a data de emissão como hoje', () => {
      const orc = criarOrcamentoVazio();
      const today = new Date().toISOString().split('T')[0];
      expect(orc.dataEmissao).toBe(today);
    });

    it('deve definir validade padrão de 30 dias', () => {
      const orc = criarOrcamentoVazio();
      expect(orc.validadeDias).toBe(30);
    });

    it('deve inicializar cliente com campos vazios', () => {
      const orc = criarOrcamentoVazio();
      expect(orc.cliente.nome).toBe('');
      expect(orc.cliente.morada).toBe('');
      expect(orc.cliente.nif).toBe('');
      expect(orc.cliente.email).toBe('');
    });

    it('deve inicializar empresa com campos vazios', () => {
      const orc = criarOrcamentoVazio();
      expect(orc.empresa.nome).toBe('');
      expect(orc.empresa.morada).toBe('');
      expect(orc.empresa.nif).toBe('');
      expect(orc.empresa.telefone).toBe('');
      expect(orc.empresa.email).toBe('');
      expect(orc.empresa.logoBase64).toBeUndefined();
    });

    it('deve inicializar itens como array vazio', () => {
      const orc = criarOrcamentoVazio();
      expect(orc.itens).toEqual([]);
    });

    it('deve inicializar custos e margem como zero', () => {
      const orc = criarOrcamentoVazio();
      expect(orc.custoMateriais).toBe(0);
      expect(orc.margemPercentagem).toBe(0);
    });

    it('deve inicializar notas como string vazia', () => {
      const orc = criarOrcamentoVazio();
      expect(orc.notas).toBe('');
    });
  });
});
