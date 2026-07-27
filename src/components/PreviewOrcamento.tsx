import type { Orcamento } from '../types/orcamento';
import { calcularSubtotalItens, calcularTotalFinal } from '../utils/calculos';

interface PreviewOrcamentoProps {
  orcamento: Orcamento;
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function PreviewOrcamento({ orcamento }: PreviewOrcamentoProps) {
  const subtotal = calcularSubtotalItens(orcamento.itens);
  const totalFinal = calcularTotalFinal(orcamento);
  const valorMargem = totalFinal - subtotal - orcamento.custoMateriais;

  return (
    <div className="bg-paper p-6 md:p-8 font-sans" id="preview-content" style={{ maxWidth: '595px' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-guide/40 mb-6">
        {/* Left: company info */}
        <div className="flex-1">
          {orcamento.empresa.logoBase64 && (
            <img
              src={orcamento.empresa.logoBase64}
              alt="Logo empresa"
              className="max-h-16 mb-3 object-contain"
            />
          )}
          <h1 className="font-mono text-xl text-ink font-semibold mb-1">
            {orcamento.empresa.nome || 'Nome da Empresa'}
          </h1>
          {orcamento.empresa.nif && (
            <p className="text-sm text-guide font-mono">NIF: {orcamento.empresa.nif}</p>
          )}
          {orcamento.empresa.morada && (
            <p className="text-sm text-guide">{orcamento.empresa.morada}</p>
          )}
          {orcamento.empresa.telefone && (
            <p className="text-sm text-guide">{orcamento.empresa.telefone}</p>
          )}
          {orcamento.empresa.email && (
            <p className="text-sm text-guide">{orcamento.empresa.email}</p>
          )}
        </div>

        {/* Right: orcamento info */}
        <div className="text-right font-mono text-sm">
          <p className="text-ink text-lg font-semibold">{orcamento.numero}</p>
          <p className="text-guide">Data: {formatDate(orcamento.dataEmissao)}</p>
          <p className="text-guide">Válido por {orcamento.validadeDias} dias</p>
        </div>
      </div>

      {/* Client info box */}
      <div className="border border-guide/40 p-4 mb-6 rounded-sm">
        <p className="font-mono text-xs uppercase tracking-wider text-guide mb-2">Destinatário</p>
        <p className="text-ink font-semibold">{orcamento.cliente.nome || '—'}</p>
        {orcamento.cliente.nif && (
          <p className="text-sm text-guide font-mono">NIF: {orcamento.cliente.nif}</p>
        )}
        {orcamento.cliente.morada && <p className="text-sm text-guide">{orcamento.cliente.morada}</p>}
        {orcamento.cliente.email && <p className="text-sm text-guide">{orcamento.cliente.email}</p>}
      </div>

      {/* Items table */}
      {orcamento.itens.length > 0 && (
        <div className="mb-6">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 pb-2 border-b-2 border-guide/40 font-mono text-xs uppercase tracking-wider text-guide">
            <div className="col-span-1 text-right">#</div>
            <div className="col-span-5">Descrição</div>
            <div className="col-span-2 text-right">Qtd.</div>
            <div className="col-span-2 text-right">Preço Unit.</div>
            <div className="col-span-2 text-right">Subtotal</div>
          </div>

          {/* Rows */}
          {orcamento.itens.map((item, idx) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-2 py-2 border-b border-guide/20 font-mono text-sm"
            >
              <div className="col-span-1 text-right text-guide">{idx + 1}</div>
              <div className="col-span-5 text-ink">{item.descricao || '—'}</div>
              <div className="col-span-2 text-right text-ink">{item.quantidade}</div>
              <div className="col-span-2 text-right text-ink">
                {formatCurrency(item.precoUnitario)}
              </div>
              <div className="col-span-2 text-right text-ink font-semibold">
                {formatCurrency(item.quantidade * item.precoUnitario)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary lines */}
      <div className="border-t-2 border-guide/40 pt-4 mb-6 space-y-2 font-mono text-sm">
        <div className="flex justify-between text-guide">
          <span>Subtotal itens</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {orcamento.custoMateriais > 0 && (
          <div className="flex justify-between text-guide">
            <span>Custo de materiais</span>
            <span>{formatCurrency(orcamento.custoMateriais)}</span>
          </div>
        )}
        {orcamento.margemPercentagem > 0 && (
          <div className="flex justify-between text-guide">
            <span>Margem ({orcamento.margemPercentagem}%)</span>
            <span>{formatCurrency(valorMargem)}</span>
          </div>
        )}
      </div>

      {/* STAMP - Total Final */}
      <div className="stamp-border p-6 md:p-8 text-center mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-guide mb-2">Total</p>
        <p className="font-mono text-4xl md:text-5xl text-stamp font-bold">
          {formatCurrency(totalFinal)}
        </p>
      </div>

      {/* Validity note */}
      <p className="text-xs text-guide font-mono text-center">
        Proposta válida por {orcamento.validadeDias} dias a partir de{' '}
        {formatDate(orcamento.dataEmissao)}.
      </p>

      {/* Notas */}
      {orcamento.notas && (
        <div className="mt-6 pt-4 border-t border-guide/30">
          <p className="font-mono text-xs uppercase tracking-wider text-guide mb-2">Notas</p>
          <p className="text-sm text-ink whitespace-pre-wrap">{orcamento.notas}</p>
        </div>
      )}
    </div>
  );
}
