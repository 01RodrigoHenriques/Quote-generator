import { describe, it, expect } from 'vitest';
import {
  validarNIF,
  validarEmail,
  validarCampoObrigatorio,
  validarItemOrcamento,
  validarOrcamento,
} from './validacoes';

describe('validacoes', () => {
  describe('validarNIF', () => {
    it('deve retornar null para NIF vazio', () => {
      expect(validarNIF('')).toBeNull();
    });

    it('deve retornar erro para NIF com menos de 9 dígitos', () => {
      expect(validarNIF('12345')).toBe('NIF deve ter 9 dígitos');
    });

    it('deve retornar erro para NIF com mais de 9 dígitos', () => {
      expect(validarNIF('1234567890')).toBe('NIF deve ter 9 dígitos');
    });

    it('deve retornar erro para NIF com caracteres não numéricos', () => {
      expect(validarNIF('12345678A')).toBe('NIF deve ter 9 dígitos');
    });

    it('deve validar um NIF de pessoa singular válido', () => {
      // 123456789: check digit calculado corretamente
      expect(validarNIF('123456789')).toBeNull();
    });

    it('deve validar um NIF de empresa válido', () => {
      // 500123454: NIF empresa com check digit válido (calculado)
      expect(validarNIF('500123454')).toBeNull();
    });

    it('deve aceitar NIF com formato válido independente do check digit', () => {
      // Com validação simplificada, qualquer NIF com 9 dígitos e primeiro dígito válido é aceite
      expect(validarNIF('123456780')).toBeNull();
      expect(validarNIF('123456789')).toBeNull();
    });

    it('deve retornar erro para primeiro dígito inválido', () => {
      // 0xxxxxxxx não é válido
      expect(validarNIF('012345678')).toBe('NIF inválido');
    });
  });

  describe('validarEmail', () => {
    it('deve retornar null para email vazio', () => {
      expect(validarEmail('')).toBeNull();
    });

    it('deve validar um email válido', () => {
      expect(validarEmail('teste@email.pt')).toBeNull();
    });

    it('deve retornar erro para email sem @', () => {
      expect(validarEmail('testeemail.pt')).toBe('Email inválido');
    });

    it('deve retornar erro para email sem domínio', () => {
      expect(validarEmail('teste@')).toBe('Email inválido');
    });

    it('deve retornar erro para email sem nome', () => {
      expect(validarEmail('@email.pt')).toBe('Email inválido');
    });

    it('deve retornar erro para email com espaços', () => {
      expect(validarEmail('teste @email.pt')).toBe('Email inválido');
    });
  });

  describe('validarCampoObrigatorio', () => {
    it('deve retornar null para valor preenchido', () => {
      expect(validarCampoObrigatorio('João Silva', 'Nome')).toBeNull();
    });

    it('deve retornar erro para valor vazio', () => {
      expect(validarCampoObrigatorio('', 'Nome')).toBe('Nome é obrigatório');
    });

    it('deve retornar erro para valor apenas espaços', () => {
      expect(validarCampoObrigatorio('   ', 'Nome')).toBe('Nome é obrigatório');
    });
  });

  describe('validarItemOrcamento', () => {
    it('deve retornar erros vazios para item válido', () => {
      const errors = validarItemOrcamento('Serviço', 2, 50, 0);
      expect(errors).toEqual({});
    });

    it('deve retornar erro para descrição vazia', () => {
      const errors = validarItemOrcamento('', 2, 50, 0);
      expect(errors['item-0-descricao']).toBe('Descrição obrigatória');
    });

    it('deve retornar erro para quantidade zero', () => {
      const errors = validarItemOrcamento('Serviço', 0, 50, 0);
      expect(errors['item-0-quantidade']).toBe('Quantidade deve ser maior que 0');
    });

    it('deve retornar erro para quantidade negativa', () => {
      const errors = validarItemOrcamento('Serviço', -1, 50, 0);
      expect(errors['item-0-quantidade']).toBe('Quantidade deve ser maior que 0');
    });

    it('deve retornar erro para preço negativo', () => {
      const errors = validarItemOrcamento('Serviço', 1, -10, 0);
      expect(errors['item-0-preco']).toBe('Preço não pode ser negativo');
    });

    it('deve permitir preço zero', () => {
      const errors = validarItemOrcamento('Serviço grátis', 1, 0, 0);
      expect(errors).toEqual({});
    });

    it('deve usar o index correto nos erros', () => {
      const errors = validarItemOrcamento('', 0, -1, 3);
      expect(errors['item-3-descricao']).toBe('Descrição obrigatória');
      expect(errors['item-3-quantidade']).toBe('Quantidade deve ser maior que 0');
      expect(errors['item-3-preco']).toBe('Preço não pode ser negativo');
    });
  });

  describe('validarOrcamento', () => {
    it('deve retornar válido para orçamento completo', () => {
      const result = validarOrcamento(
        { nome: 'Empresa Lda', nif: '500123454' },
        { nome: 'João Silva', nif: '123456789' },
        [{ descricao: 'Serviço', quantidade: 1, precoUnitario: 100 }]
      );
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('deve retornar erro para empresa sem nome', () => {
      const result = validarOrcamento(
        { nome: '' },
        { nome: 'João Silva' },
        [{ descricao: 'Serviço', quantidade: 1, precoUnitario: 100 }]
      );
      expect(result.isValid).toBe(false);
      expect(result.errors['empresa.nome']).toBe('Nome da empresa é obrigatório');
    });

    it('deve retornar erro para cliente sem nome', () => {
      const result = validarOrcamento(
        { nome: 'Empresa Lda' },
        { nome: '' },
        [{ descricao: 'Serviço', quantidade: 1, precoUnitario: 100 }]
      );
      expect(result.isValid).toBe(false);
      expect(result.errors['cliente.nome']).toBe('Nome do cliente é obrigatório');
    });

    it('deve retornar erro para itens vazios', () => {
      const result = validarOrcamento(
        { nome: 'Empresa Lda' },
        { nome: 'João Silva' },
        []
      );
      expect(result.isValid).toBe(false);
      expect(result.errors['itens']).toBe('Adicione pelo menos um item');
    });

    it('deve retornar múltiplos erros', () => {
      const result = validarOrcamento(
        { nome: '', nif: 'invalido', email: 'bad' },
        { nome: '' },
        []
      );
      expect(result.isValid).toBe(false);
      expect(result.errors['empresa.nome']).toBe('Nome da empresa é obrigatório');
      expect(result.errors['empresa.nif']).toBe('NIF deve ter 9 dígitos');
      expect(result.errors['empresa.email']).toBe('Email inválido');
      expect(result.errors['cliente.nome']).toBe('Nome do cliente é obrigatório');
      expect(result.errors['itens']).toBe('Adicione pelo menos um item');
    });
  });
});
