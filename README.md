# Orçamento Builder

> Gerador de orçamentos profissionais — tudo no browser, sem backend.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Demo

[▶ Ver demo em vídeo](preview%20MP4/live.mp4)

---

## O que é

Ferramenta client-side para criar orçamentos formais com a estética de **"caderno técnico"**. Preenche o formulário, vê o preview em tempo real e exporta um PDF vetorial pronto a enviar ao cliente.

- **Zero backend** — tudo corre no browser
- **Persistência local** — os orçamentos ficam guardados em `localStorage`
- **PDF vetorial** — texto selecionável, corte perfeito entre páginas, números de página
- **Histórico** — reabre, edita ou elimina orçamentos anteriores

## Direção Visual

| Elemento | Valor |
|---|---|
| Fundo | `#F7F5F0` (papel off-white) |
| Texto | `#1A1D1E` (tinta quase-preta) |
| Accent | `#2B4C7E` (azul técnico) |
| Destaque/Total | `#D9631E` (laranja carimbo) |
| Linhas guia | `#8A8580` (grafite) |
| Títulos | JetBrains Mono |
| Corpo | Inter |

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Vite + React 19 + TypeScript |
| Estilos | Tailwind CSS v3 |
| PDF | jsPDF (renderização vetorial nativa) |
| Captura | html2canvas (preview) |
| Fontes | JetBrains Mono + Inter (Google Fonts) |
| Persistência | `localStorage` |

## Começar

```bash
# Instalar dependências
npm install

# Arrancar o servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## Estrutura

```
src/
├── components/
│   ├── ExportPDFButton.tsx      # Geração de PDF vetorial com jsPDF
│   ├── FormularioOrcamento.tsx   # Formulário em 4 secções
│   ├── HistoricoOrcamentos.tsx   # Lista de orçamentos guardados
│   └── PreviewOrcamento.tsx      # Preview em tempo real
── types/
│   └── orcamento.ts              # Interfaces TypeScript
├── utils/
│   ├── calculos.ts               # Funções puras de cálculo
│   ├── localStorage.ts           # Persistência e geração de números
│   └── state.ts                  # Factory de estado inicial
├── App.tsx
├── main.tsx
└── index.css
```

## Funcionalidades

- **4 secções de formulário** — Empresa, Cliente, Itens (tabela editável), Notas
- **Preview em tempo real** — atualiza conforme escreves
- **Carimbo do total** — caixa com borda dupla, estilo aprovação de engenharia
- **PDF vetorial** — texto como texto (selecionável), corte perfeito entre linhas da tabela
- **Persistência** — guardar, listar, reabrir e eliminar orçamentos
- **Responsivo** — empilha verticalmente em mobile, duas colunas em desktop

---

Desenvolvido por Rodrigo Henriques.
