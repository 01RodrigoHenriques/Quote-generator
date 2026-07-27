import React, { useCallback } from 'react';
import type { Orcamento, ItemOrcamento, DadosEmpresa, DadosCliente } from '../types/orcamento';
import { validarNIF, validarEmail, validarCampoObrigatorio } from '../utils/validacoes';

interface FormularioOrcamentoProps {
  orcamento: Orcamento;
  onChange: (orcamento: Orcamento) => void;
  onValidate?: (erros: Record<string, string>) => void;
}

function SectionNumber({ num }: { num: string }) {
  return (
    <span className="font-mono text-blueprint text-sm tracking-widest mr-3 opacity-70">
      {num} —
    </span>
  );
}

function InputField({
  label,
  value,
  onChange,
  onBlur,
  error,
  type = 'text',
  placeholder = '',
  validate,
}: {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  onBlur?: () => void;
  error?: string;
  type?: string;
  placeholder?: string;
  validate?: (val: string) => string | null;
}) {
  const hasError = !!error;

  return (
    <div className="mb-4">
      <label className="block text-xs font-mono uppercase tracking-wider text-guide mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          onBlur?.();
          if (validate && typeof value === 'string') {
            validate(value);
          }
        }}
        placeholder={placeholder}
        className={`
          w-full bg-transparent border-b-2 outline-none py-1 text-ink font-sans transition-colors duration-200
          ${hasError
            ? 'border-stamp focus:border-stamp'
            : 'border-guide/40 focus:border-blueprint'}
        `}
      />
      {hasError && (
        <p className="text-xs text-stamp font-mono mt-1" role="alert">{error}</p>
      )}
    </div>
  );
}

function EmpresaSection({
  empresa,
  onChange,
  erros = {},
}: {
  empresa: DadosEmpresa;
  onChange: (empresa: DadosEmpresa) => void;
  erros?: Record<string, string>;
}) {
  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...empresa, logoBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    },
    [empresa, onChange]
  );

  const validateNIF = (val: string) => {
    const err = validarNIF(val);
    if (err) onChange({ ...empresa, nif: val });
    return err;
  };

  const validateEmail = (val: string) => {
    const err = validarEmail(val);
    if (err) onChange({ ...empresa, email: val });
    return err;
  };

  return (
    <section className="mb-8">
      <h2 className="font-mono text-lg uppercase tracking-wide text-ink mb-4 flex items-center">
        <SectionNumber num="01" />
        Empresa
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <InputField
          label="Nome da Empresa"
          value={empresa.nome}
          onChange={(val) => onChange({ ...empresa, nome: val })}
          placeholder="Ex: Construções Silva, Lda."
          error={erros['empresa.nome']}
        />
        <InputField
          label="NIF"
          value={empresa.nif || ''}
          onChange={(val) => onChange({ ...empresa, nif: val })}
          placeholder="Ex: 501234567"
          error={erros['empresa.nif']}
          validate={(val) => {
            const err = validarNIF(val);
            if (err) onChange({ ...empresa, nif: val });
            return err;
          }}
        />
        <InputField
          label="Morada"
          value={empresa.morada || ''}
          onChange={(val) => onChange({ ...empresa, morada: val })}
          placeholder="Ex: Rua Augusta, 100, Lisboa"
        />
        <InputField
          label="Telefone"
          value={empresa.telefone || ''}
          onChange={(val) => onChange({ ...empresa, telefone: val })}
          placeholder="Ex: +351 912 345 678"
        />
        <InputField
          label="Email"
          value={empresa.email || ''}
          onChange={(val) => onChange({ ...empresa, email: val })}
          placeholder="Ex: geral@construcoes-silva.pt"
          error={erros['empresa.email']}
        />
        <div className="mb-4">
          <label className="block text-xs font-mono uppercase tracking-wider text-guide mb-1">
            Logo
          </label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="text-sm text-guide file:mr-3 file:py-1 file:px-3 file:border-0 file:bg-transparent file:text-blueprint file:font-mono file:text-xs file:uppercase file:tracking-wider file:cursor-pointer"
            />
            {empresa.logoBase64 && (
              <button
                onClick={() => onChange({ ...empresa, logoBase64: undefined })}
                className="text-guide hover:text-stamp transition-colors duration-200 font-mono text-sm"
                aria-label="Remover logo"
              >
                × remover
              </button>
            )}
          </div>
          {empresa.logoBase64 && (
            <p className="text-xs text-guide mt-1 font-mono">Logo carregada ✓</p>
          )}
        </div>
      </div>
    </section>
  );
}

function ClienteSection({
  cliente,
  onChange,
  erros = {},
}: {
  cliente: DadosCliente;
  onChange: (cliente: DadosCliente) => void;
  erros?: Record<string, string>;
}) {
  return (
    <section className="mb-8">
      <h2 className="font-mono text-lg uppercase tracking-wide text-ink mb-4 flex items-center">
        <SectionNumber num="02" />
        Cliente
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <InputField
          label="Nome do Cliente"
          value={cliente.nome}
          onChange={(val) => onChange({ ...cliente, nome: val })}
          placeholder="Ex: João Santos"
          error={erros['cliente.nome']}
        />
        <InputField
          label="NIF"
          value={cliente.nif || ''}
          onChange={(val) => onChange({ ...cliente, nif: val })}
          placeholder="Ex: 123456789"
          error={erros['cliente.nif']}
        />
        <InputField
          label="Morada"
          value={cliente.morada || ''}
          onChange={(val) => onChange({ ...cliente, morada: val })}
          placeholder="Ex: Av. da Liberdade, 50, Porto"
        />
        <InputField
          label="Email"
          value={cliente.email || ''}
          onChange={(val) => onChange({ ...cliente, email: val })}
          placeholder="Ex: joao.santos@email.pt"
          error={erros['cliente.email']}
        />
      </div>
    </section>
  );
}

function ItensSection({
  itens,
  custoMateriais,
  margemPercentagem,
  onItensChange,
  onCustoMateriaisChange,
  onMargemChange,
  erros = {},
}: {
  itens: ItemOrcamento[];
  custoMateriais: number;
  margemPercentagem: number;
  onItensChange: (itens: ItemOrcamento[]) => void;
  onCustoMateriaisChange: (val: number) => void;
  onMargemChange: (val: number) => void;
  erros?: Record<string, string>;
}) {
  const addItem = () => {
    const newItem: ItemOrcamento = {
      id: crypto.randomUUID(),
      descricao: '',
      quantidade: 1,
      precoUnitario: 0,
    };
    onItensChange([...itens, newItem]);
  };

  const removeItem = (id: string) => {
    onItensChange(itens.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof ItemOrcamento, value: string | number) => {
    onItensChange(
      itens.map((item) => {
        if (item.id !== id) return item;
        return { ...item, [field]: value };
      })
    );
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val);

  return (
    <section className="mb-8">
      <h2 className="font-mono text-lg uppercase tracking-wide text-ink mb-4 flex items-center">
        <SectionNumber num="03" />
        Itens do Orçamento
      </h2>

      {erros['itens'] && (
        <p className="text-xs text-stamp font-mono mb-3" role="alert">{erros['itens']}</p>
      )}

      {/* Table header */}
      <div className="hidden md:grid grid-cols-12 gap-2 pb-2 border-b-2 border-guide/40 font-mono text-xs uppercase tracking-wider text-guide">
        <div className="col-span-5">Descrição</div>
        <div className="col-span-2 text-right">Quantidade</div>
        <div className="col-span-2 text-right">Preço Unit.</div>
        <div className="col-span-2 text-right">Subtotal</div>
        <div className="col-span-1"></div>
      </div>

      {/* Rows */}
      {itens.map((item, idx) => {
        const subtotal = item.quantidade * item.precoUnitario;
        const descError = erros[`item-${idx}-descricao`];
        const qtdError = erros[`item-${idx}-quantidade`];
        const precoError = erros[`item-${idx}-preco`];

        return (
          <div
            key={item.id}
            className="grid grid-cols-1 md:grid-cols-12 gap-2 py-3 border-b border-guide/20 items-center"
          >
            {/* Description - full width on mobile */}
            <div className="md:col-span-5 mb-2 md:mb-0">
              <span className="md:hidden text-xs font-mono text-guide uppercase tracking-wider block mb-1">
                Descrição
              </span>
              <input
                type="text"
                value={item.descricao}
                onChange={(e) => updateItem(item.id, 'descricao', e.target.value)}
                placeholder="Ex: Fornecimento e instalação de..."
                className={`
                  w-full bg-transparent border-b outline-none py-1 text-ink font-sans transition-colors duration-200
                  ${descError ? 'border-stamp focus:border-stamp' : 'border-guide/30 focus:border-blueprint'}
                `}
              />
              {descError && (
                <p className="text-xs text-stamp font-mono mt-1" role="alert">{descError}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <span className="md:hidden text-xs font-mono text-guide uppercase tracking-wider block mb-1">
                Quantidade
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={item.quantidade}
                onChange={(e) =>
                  updateItem(item.id, 'quantidade', parseFloat(e.target.value) || 0)
                }
                className={`
                  w-full bg-transparent border-b outline-none py-1 text-ink font-mono text-right transition-colors duration-200
                  ${qtdError ? 'border-stamp focus:border-stamp' : 'border-guide/30 focus:border-blueprint'}
                `}
              />
              {qtdError && (
                <p className="text-xs text-stamp font-mono mt-1" role="alert">{qtdError}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <span className="md:hidden text-xs font-mono text-guide uppercase tracking-wider block mb-1">
                Preço Unit. (€)
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.precoUnitario}
                onChange={(e) =>
                  updateItem(item.id, 'precoUnitario', parseFloat(e.target.value) || 0)
                }
                className={`
                  w-full bg-transparent border-b outline-none py-1 text-ink font-mono text-right transition-colors duration-200
                  ${precoError ? 'border-stamp focus:border-stamp' : 'border-guide/30 focus:border-blueprint'}
                `}
              />
              {precoError && (
                <p className="text-xs text-stamp font-mono mt-1" role="alert">{precoError}</p>
              )}
            </div>
            <div className="md:col-span-2 text-right font-mono text-ink">
              <span className="md:hidden text-xs font-mono text-guide uppercase tracking-wider block mb-1">
                Subtotal
              </span>
              {formatCurrency(subtotal)}
            </div>
            <div className="md:col-span-1 text-right">
              <button
                onClick={() => removeItem(item.id)}
                className="text-guide hover:text-stamp transition-colors duration-200 font-mono text-lg"
                aria-label="Remover item"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}

      {itens.length === 0 && (
        <p className="text-guide font-mono text-sm py-4 text-center border-b border-guide/20">
          Nenhum item adicionado. Clique abaixo para começar.
        </p>
      )}

      {/* Add item button - text style */}
      <button
        onClick={addItem}
        className="mt-4 text-blueprint font-mono text-sm underline underline-offset-4 hover:text-ink transition-colors duration-200"
      >
        + Adicionar item
      </button>

      {/* Custo de materiais + Margem */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t-2 border-guide/40">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-guide mb-1">
            Custo de Materiais (€)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={custoMateriais || ''}
            onChange={(e) =>
              onCustoMateriaisChange(parseFloat(e.target.value) || 0)
            }
            className="w-full bg-transparent border-b-2 border-guide/40 focus:border-blueprint outline-none py-1 text-ink font-mono transition-colors duration-200"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-guide mb-1">
            Margem (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={margemPercentagem || ''}
            onChange={(e) => onMargemChange(parseFloat(e.target.value) || 0)}
            className="w-full bg-transparent border-b-2 border-guide/40 focus:border-blueprint outline-none py-1 text-ink font-mono transition-colors duration-200"
          />
        </div>
      </div>
    </section>
  );
}

export default function FormularioOrcamento({ orcamento, onChange, onValidate }: FormularioOrcamentoProps) {
  const handleValidate = useCallback(() => {
    const { validarOrcamento } = require('../utils/validacoes');
    const result = validarOrcamento(
      orcamento.empresa,
      orcamento.cliente,
      orcamento.itens
    );
    onChange({ ...orcamento, erros: result.errors });
    onValidate?.(result.errors);
  }, [orcamento, onChange, onValidate]);

  return (
    <div>
      <EmpresaSection
        empresa={orcamento.empresa}
        onChange={(empresa) => onChange({ ...orcamento, empresa })}
        erros={orcamento.erros}
      />
      <ClienteSection
        cliente={orcamento.cliente}
        onChange={(cliente) => onChange({ ...orcamento, cliente })}
        erros={orcamento.erros}
      />
      <ItensSection
        itens={orcamento.itens}
        custoMateriais={orcamento.custoMateriais}
        margemPercentagem={orcamento.margemPercentagem}
        onItensChange={(itens) => onChange({ ...orcamento, itens })}
        onCustoMateriaisChange={(val) => onChange({ ...orcamento, custoMateriais: val })}
        onMargemChange={(val) => onChange({ ...orcamento, margemPercentagem: val })}
        erros={orcamento.erros}
      />
      <NotasSection
        notas={orcamento.notas || ''}
        onChange={(notas) => onChange({ ...orcamento, notas })}
      />
      {/* Validation trigger */}
      <div className="mb-4">
        <button
          onClick={handleValidate}
          className="text-blueprint font-mono text-sm underline underline-offset-4 hover:text-ink transition-colors duration-200"
        >
          ✓ Validar formulário
        </button>
      </div>
    </div>
  );
}

function NotasSection({ notas, onChange }: { notas: string; onChange: (val: string) => void }) {
  return (
    <section className="mb-8">
      <h2 className="font-mono text-lg uppercase tracking-wide text-ink mb-4 flex items-center">
        <SectionNumber num="04" />
        Notas
      </h2>
      <textarea
        value={notas}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Condições de pagamento, prazo de entrega, garantias..."
        rows={4}
        className="w-full bg-transparent border-b-2 border-guide/40 focus:border-blueprint outline-none py-2 text-ink font-sans transition-colors duration-200 resize-none"
      />
    </section>
  );
}
