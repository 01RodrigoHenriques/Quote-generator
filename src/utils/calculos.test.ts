import { describe, it, expect } from 'vitest';
import type { ItemOrcamento, Orcamento } from '../types/orcamento';
import {
  calcularSubtotalItens,
  calcularTotalComMateriais,
  calcularTotalComMargem,
  calcularTotalFinal,
} from './calculos';

function criarItem(overrides: Partial<ItemOrcamento> = {}): ItemOrcamento {
  return {
    id: crypto.randomUUID(),
    descricao: 'Item teste',
    quantidade: 1,
    precoUnitario: 100,
    ...overrides,
  };
}

function criarOrcamento(overrides: Partial<Orcamento> = {}): Orcamento {
  return {
    id: crypto.randomUUID(),
    numero: 'ORC-2026-001',
    dataEmissao: '2026-01-15',
    validadeDias: 30,
    cliente: { nome: 'Cliente Teste', nif: '123456789' },
    empresa: { nome: 'Empresa Teste', nif: '987654321' },
    itens: [criarItem()],
    custoMateriais: 0,
    margemPercentagem: 0,
    ...overrides,
  };
}

describe('calculos', () => {
  describe('calcularSubtotalItens', () => {
    it('deve retornar 0 para lista vazia', () => {
      expect(calcularSubtotalItens([])).toBe(0);
    });

    it('deve calcular o subtotal de um único item', () => {
      const itens = [criarItem({ quantidade: 2, precoUnitario: 50 })];
      expect(calcularSubtotalItens(itens)).toBe(100);
    });

    it('deve calcular o subtotal de múltiplos itens', () => {
      const itens = [
        criarItem({ quantidade: 2, precoUnitario: 50 }),   // 100
        criarItem({ quantidade: 3, precoUnitario: 30 }),   // 90
        criarItem({ quantidade: 1, precoUnitario: 200 }),  // 200
      ];
      expect(calcularSubtotalItens(itens)).toBe(390);
    });

    it('deve lidar com quantidade zero', () => {
      const itens = [criarItem({ quantidade: 0, precoUnitario: 100 })];
      expect(calcularSubtotalItens(itens)).toBe(0);
    });

    it('deve lidar com preço unitário zero', () => {
      const itens = [criarItem({ quantidade: 5, precoUnitario: 0 })];
      expect(calcularSubtotalItens(itens)).toBe(0);
    });

    it('deve lidar com valores decimais', () => {
      const itens = [criarItem({ quantidade: 1.5, precoUnitario: 33.33 })];
      expect(calcularSubtotalItens(itens)).toBeCloseTo(49.995, 2);
    });
  });

  describe('calcularTotalComMateriais', () => {
    it('deve somar subtotal e custo de materiais', () => {
      expect(calcularTotalComMateriais(100, 50)).toBe(150);
    });

    it('deve retornar o subtotal quando custo de materiais é zero', () => {
      expect(calcularTotalComMateriais(200, 0)).toBe(200);
    });

    it('deve lidar com ambos zero', () => {
      expect(calcularTotalComMateriais(0, 0)).toBe(0);
    });
  });

  describe('calcularTotalComMargem', () => {
    it('deve aplicar a margem percentual corretamente', () => {
      expect(calcularTotalComMargem(100, 20)).toBe(120);
    });

    it('deve retornar o valor original quando margem é zero', () => {
      expect(calcularTotalComMargem(100, 0)).toBe(100);
    });

    it('deve lidar com margem de 100%', () => {
      expect(calcularTotalComMargem(50, 100)).toBe(100);
    });

    it('deve lidar com valores decimais na margem', () => {
      expect(calcularTotalComMargem(100, 12.5)).toBe(112.5);
    });
  });

  describe('calcularTotalFinal', () => {
    it('deve calcular o total apenas com itens', () => {
      const orc = criarOrcamento({
        itens: [criarItem({ quantidade: 2, precoUnitario: 50 })],
        custoMateriais: 0,
        margemPercentagem: 0,
      });
      expect(calcularTotalFinal(orc)).toBe(100);
    });

    it('deve calcular o total com itens e materiais', () => {
      const orc = criarOrcamento({
        itens: [criarItem({ quantidade: 1, precoUnitario: 100 })],
        custoMateriais: 50,
        margemPercentagem: 0,
      });
      expect(calcularTotalFinal(orc)).toBe(150);
    });

    it('deve calcular o total com itens, materiais e margem', () => {
      const orc = criarOrcamento({
        itens: [criarItem({ quantidade: 1, precoUnitario: 100 })],
        custoMateriais: 50,
        margemPercentagem: 20,
      });
      expect(calcularTotalFinal(orc)).toBe(180); // (100 + 50) * 1.2 = 180
    });

    it('deve lidar com orçamento vazio', () => {
      const orc = criarOrcamento({ itens: [] });
      expect(calcularTotalFinal(orc)).toBe(0);
    });

    it('deve lidar com múltiplos itens e margem', () => {
      const orc = criarOrcamento({
        itens: [
          criarItem({ quantidade: 2, precoUnitario: 50 }),   // 100
          criarItem({ quantidade: 1, precoUnitario: 200 }),  // 200
        ],
        custoMateriais: 100,
        margemPercentagem: 10,
      });
      expect(calcularTotalFinal(orc)).toBeCloseTo(440, 1); // (100 + 200 + 100) * 1.1 = 440
    });
  });
});
