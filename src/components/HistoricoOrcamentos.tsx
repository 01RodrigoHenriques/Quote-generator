import { listarOrcamentos, eliminarOrcamento } from '../utils/localStorage';
import { calcularTotalFinal } from '../utils/calculos';
import type { Orcamento } from '../types/orcamento';

interface HistoricoOrcamentosProps {
  onReabrir: (orcamento: Orcamento) => void;
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function HistoricoOrcamentos({ onReabrir }: HistoricoOrcamentosProps) {
  const orcamentos = listarOrcamentos();

  const handleEliminar = (id: string) => {
    if (confirm('Tem a certeza que deseja eliminar este orçamento?')) {
      eliminarOrcamento(id);
      // Trigger re-render by dispatching a storage event
      window.dispatchEvent(new Event('orcamentos-changed'));
    }
  };

  if (orcamentos.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-mono text-guide text-sm">
          Ainda não há orçamentos neste caderno.
        </p>
        <p className="font-mono text-guide text-sm mt-1">
          Cria o primeiro na aba Orçamento.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Table header */}
      <div className="hidden md:grid grid-cols-12 gap-3 pb-2 border-b-2 border-guide/40 font-mono text-xs uppercase tracking-wider text-guide">
        <div className="col-span-2">Número</div>
        <div className="col-span-3">Cliente</div>
        <div className="col-span-2 text-right">Data</div>
        <div className="col-span-2 text-right">Total</div>
        <div className="col-span-3 text-right">Ações</div>
      </div>

      {/* Rows */}
      {orcamentos.map((orc) => {
        const total = calcularTotalFinal(orc);
        return (
          <div
            key={orc.id}
            className="grid grid-cols-1 md:grid-cols-12 gap-2 py-3 border-b border-guide/20 items-center"
          >
            <div className="md:col-span-2 font-mono text-ink text-sm">
              <span className="md:hidden text-xs text-guide uppercase tracking-wider block mb-1">
                Número
              </span>
              {orc.numero}
            </div>
            <div className="md:col-span-3 text-ink">
              <span className="md:hidden text-xs text-guide uppercase tracking-wider block mb-1">
                Cliente
              </span>
              {orc.cliente.nome || '—'}
            </div>
            <div className="md:col-span-2 text-right font-mono text-sm text-guide">
              <span className="md:hidden text-xs text-guide uppercase tracking-wider block mb-1">
                Data
              </span>
              {formatDate(orc.dataEmissao)}
            </div>
            <div className="md:col-span-2 text-right font-mono text-sm text-ink font-semibold">
              <span className="md:hidden text-xs text-guide uppercase tracking-wider block mb-1">
                Total
              </span>
              {formatCurrency(total)}
            </div>
            <div className="md:col-span-3 text-right space-x-3">
              <span className="md:hidden text-xs text-guide uppercase tracking-wider block mb-1">
                Ações
              </span>
              <button
                onClick={() => onReabrir(orc)}
                className="text-blueprint font-mono text-sm underline underline-offset-2 hover:text-ink transition-colors duration-200"
              >
                Reabrir
              </button>
              <button
                onClick={() => handleEliminar(orc.id)}
                className="text-guide font-mono text-sm underline underline-offset-2 hover:text-stamp transition-colors duration-200"
              >
                Eliminar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
