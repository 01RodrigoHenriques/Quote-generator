export interface ValidationErrors {
  [field: string]: string;
}

export function validarNIF(nif: string): string | null {
  if (!nif) return null; // optional field
  const cleaned = nif.replace(/\s/g, '');
  if (!/^\d{9}$/.test(cleaned)) {
    return 'NIF deve ter 9 dígitos';
  }
  // Portuguese NIF validation algorithm
  const digits = cleaned.split('').map(Number);
  const checkDigit = (digits[0] * 9 + digits[1] * 8 + digits[2] * 7 + digits[3] * 6 +
    digits[4] * 5 + digits[5] * 4 + digits[6] * 3 + digits[7] * 2) % 11;
  const expected = checkDigit < 2 ? 0 : 11 - checkDigit;
  if (digits[8] !== expected) {
    return 'NIF inválido';
  }
  // First digit: 1-6 (person), 8 (company), 9 (collective), 45 (non-resident), 70-79 (public)
  const firstTwo = digits[0] * 10 + digits[1];
  const validStarts = [1, 2, 3, 4, 5, 6, 8, 9];
  const validPublic = [70, 71, 72, 73, 74, 75, 76, 77, 78, 79];
  const validNonResident = [45];
  if (!validStarts.includes(digits[0]) && !validPublic.includes(firstTwo) && !validNonResident.includes(firstTwo)) {
    return 'NIF inválido';
  }
  return null;
}

export function validarEmail(email: string): string | null {
  if (!email) return null; // optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email inválido';
  }
  return null;
}

export function validarCampoObrigatorio(valor: string, nome: string): string | null {
  if (!valor.trim()) {
    return `${nome} é obrigatório`;
  }
  return null;
}

export function validarItemOrcamento(
  descricao: string,
  quantidade: number,
  precoUnitario: number,
  index: number
): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!descricao.trim()) {
    errors[`item-${index}-descricao`] = 'Descrição obrigatória';
  }
  if (quantidade <= 0) {
    errors[`item-${index}-quantidade`] = 'Quantidade deve ser maior que 0';
  }
  if (precoUnitario < 0) {
    errors[`item-${index}-preco`] = 'Preço não pode ser negativo';
  }
  return errors;
}

export interface OrcamentoValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

export function validarOrcamento(
  empresa: { nome: string; nif?: string; email?: string },
  cliente: { nome: string; nif?: string; email?: string },
  itens: Array<{ descricao: string; quantidade: number; precoUnitario: number }>
): OrcamentoValidationResult {
  const errors: ValidationErrors = {};

  // Empresa
  const empresaNome = validarCampoObrigatorio(empresa.nome, 'Nome da empresa');
  if (empresaNome) errors['empresa.nome'] = empresaNome;

  const empresaNIF = validarNIF(empresa.nif || '');
  if (empresaNIF) errors['empresa.nif'] = empresaNIF;

  const empresaEmail = validarEmail(empresa.email || '');
  if (empresaEmail) errors['empresa.email'] = empresaEmail;

  // Cliente
  const clienteNome = validarCampoObrigatorio(cliente.nome, 'Nome do cliente');
  if (clienteNome) errors['cliente.nome'] = clienteNome;

  const clienteNIF = validarNIF(cliente.nif || '');
  if (clienteNIF) errors['cliente.nif'] = clienteNIF;

  const clienteEmail = validarEmail(cliente.email || '');
  if (clienteEmail) errors['cliente.email'] = clienteEmail;

  // Itens
  if (itens.length === 0) {
    errors['itens'] = 'Adicione pelo menos um item';
  }

  itens.forEach((item, idx) => {
    const itemErrors = validarItemOrcamento(item.descricao, item.quantidade, item.precoUnitario, idx);
    Object.assign(errors, itemErrors);
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
