import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PreviewOrcamento from './PreviewOrcamento';
import type { Orcamento } from '../types/orcamento';

function criarOrcamentoMock(overrides: Partial<Orcamento> = {}): Orcamento {
  return {
    id: 'test-id',
    numero: 'ORC-2026-001',
    dataEmissao: '2026-01-15',
    validadeDias: 30,
    cliente: { nome: 'João Silva', nif: '123456789', morada: 'Rua Teste, 1', email: 'joao@email.pt' },
    empresa: { nome: 'Empresa Lda', nif: '987654321', morada: 'Av. Empresa, 100', telefone: '+351 912345678', email: 'geral@empresa.pt' },
    itens: [
      { id: 'item-1', descricao: 'Serviço de consultoria', quantidade: 10, precoUnitario: 50 },
    ],
    custoMateriais: 100,
    margemPercentagem: 20,
    notas: 'Pagamento a 30 dias',
    ...overrides,
  };
}

describe('PreviewOrcamento', () => {
  it('deve renderizar o número do orçamento', () => {
    const orc = criarOrcamentoMock();
    render(<PreviewOrcamento orcamento={orc} />);
    expect(screen.getByText('ORC-2026-001')).toBeInTheDocument();
  });

  it('deve renderizar o nome da empresa', () => {
    const orc = criarOrcamentoMock();
    render(<PreviewOrcamento orcamento={orc} />);
    expect(screen.getByText('Empresa Lda')).toBeInTheDocument();
  });

  it('deve renderizar o nome do cliente', () => {
    const orc = criarOrcamentoMock();
    render(<PreviewOrcamento orcamento={orc} />);
    expect(screen.getByText('João Silva')).toBeInTheDocument();
  });

  it('deve renderizar o total formatado no stamp', () => {
    const orc = criarOrcamentoMock({
      itens: [{ id: 'item-1', descricao: 'Item', quantidade: 1, precoUnitario: 100 }],
      custoMateriais: 0,
      margemPercentagem: 0,
    });
    render(<PreviewOrcamento orcamento={orc} />);
    const totalElements = screen.getAllByText('100,00 €');
    expect(totalElements.length).toBeGreaterThan(0);
  });

  it('deve renderizar a validade', () => {
    const orc = criarOrcamentoMock({ validadeDias: 45 });
    render(<PreviewOrcamento orcamento={orc} />);
    expect(screen.getByText(/Válido por 45 dias/)).toBeInTheDocument();
  });

  it('deve renderizar as notas quando existem', () => {
    const orc = criarOrcamentoMock({ notas: 'Condição especial de pagamento' });
    render(<PreviewOrcamento orcamento={orc} />);
    expect(screen.getByText('Condição especial de pagamento')).toBeInTheDocument();
  });

  it('não deve renderizar seção de notas quando são vazias', () => {
    const orc = criarOrcamentoMock({ notas: '' });
    render(<PreviewOrcamento orcamento={orc} />);
    expect(screen.queryByText('Pagamento a 30 dias')).not.toBeInTheDocument();
  });

  it('deve renderizar a tabela de itens', () => {
    const orc = criarOrcamentoMock({
      itens: [{ id: 'item-1', descricao: 'Instalação de equipamento', quantidade: 2, precoUnitario: 150 }],
    });
    render(<PreviewOrcamento orcamento={orc} />);
    expect(screen.getByText('Instalação de equipamento')).toBeInTheDocument();
    const subtotals = screen.getAllByText('300,00 €');
    expect(subtotals.length).toBeGreaterThan(0);
  });
});
