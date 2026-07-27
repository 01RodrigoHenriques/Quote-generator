import { useState, useEffect, useCallback } from 'react';
import type { Orcamento } from './types/orcamento';
import { criarOrcamentoVazio } from './utils/state';
import FormularioOrcamento from './components/FormularioOrcamento';
import PreviewOrcamento from './components/PreviewOrcamento';
import ExportPDFButton from './components/ExportPDFButton';
import HistoricoOrcamentos from './components/HistoricoOrcamentos';

type TabType = 'orcamento' | 'historico';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('orcamento');
  const [orcamento, setOrcamento] = useState<Orcamento>(criarOrcamentoVazio);
  const [, setValidationErrors] = useState<Record<string, string>>({});

  // Listen for localStorage changes (from Historico eliminating)
  useEffect(() => {
    const handler = () => {
      // Just to re-render when historico changes
    };
    window.addEventListener('orcamentos-changed', handler);
    return () => window.removeEventListener('orcamentos-changed', handler);
  }, []);

  const handleReabrir = useCallback((orc: Orcamento) => {
    setOrcamento(orc);
    setValidationErrors({});
    setActiveTab('orcamento');
  }, []);

  const handleValidate = useCallback((erros: Record<string, string>) => {
    setValidationErrors(erros);
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      {/* Top bar */}
      <header className="border-b-2 border-guide/40 bg-paper sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-mono text-lg text-ink tracking-wide">
            Orçamento Builder
          </h1>
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('orcamento')}
              className={`
                font-mono text-sm uppercase tracking-wider pb-1 border-b-2 transition-colors duration-200
                ${activeTab === 'orcamento'
                  ? 'border-blueprint text-blueprint'
                  : 'border-transparent text-guide hover:text-ink'}
              `}
            >
              Orçamento
            </button>
            <button
              onClick={() => setActiveTab('historico')}
              className={`
                font-mono text-sm uppercase tracking-wider pb-1 border-b-2 transition-colors duration-200
                ${activeTab === 'historico'
                  ? 'border-blueprint text-blueprint'
                  : 'border-transparent text-guide hover:text-ink'}
              `}
            >
              Histórico
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'orcamento' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form - first on mobile, left on desktop */}
              <div>
                <FormularioOrcamento
                  orcamento={orcamento}
                  onChange={setOrcamento}
                  onValidate={handleValidate}
                />
              </div>

              {/* Preview - second on mobile, right on desktop */}
              <div>
                <div className="lg:sticky lg:top-20">
                  <PreviewOrcamento orcamento={orcamento} />
                </div>
              </div>
            </div>

            {/* Export bar - sticky bottom */}
            <div className="sticky bottom-0 bg-paper/95 border-t-2 border-guide/40 py-3 mt-8 flex justify-center">
              <ExportPDFButton orcamento={orcamento} onValidate={handleValidate} />
            </div>
          </>
        )}

        {activeTab === 'historico' && (
          <HistoricoOrcamentos onReabrir={handleReabrir} />
        )}
      </main>
    </div>
  );
}

export default App;
