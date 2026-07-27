export interface ItemOrcamento {
  id: string;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
}

export interface DadosCliente {
  nome: string;
  morada?: string;
  nif?: string;
  email?: string;
}

export interface DadosEmpresa {
  nome: string;
  morada?: string;
  nif?: string;
  telefone?: string;
  email?: string;
  logoBase64?: string;
}

export interface Orcamento {
  id: string;
  numero: string;
  dataEmissao: string;
  validadeDias: number;
  cliente: DadosCliente;
  empresa: DadosEmpresa;
  itens: ItemOrcamento[];
  custoMateriais: number;
  margemPercentagem: number;
  notas?: string;
  erros?: Record<string, string>;
}
