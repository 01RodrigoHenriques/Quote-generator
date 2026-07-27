import { useState } from 'react';
import jsPDF from 'jspdf';
import type { Orcamento } from '../types/orcamento';
import { calcularSubtotalItens, calcularTotalFinal } from '../utils/calculos';
import { guardarOrcamento } from '../utils/localStorage';
import { validarOrcamento } from '../utils/validacoes';

interface ExportPDFButtonProps {
  orcamento: Orcamento;
  onValidate?: (erros: Record<string, string>) => void;
}

// A4 dimensions in mm
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 15;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Font config
const FONT_BODY = 'helvetica';
const FONT_MONO = 'courier';
const SIZE_XS = 7;
const SIZE_SM = 9;
const SIZE_MD = 11;
const SIZE_LG = 14;
const SIZE_XL = 18;

// Colors (grayscale equivalents for jsPDF)
const C_INK = [26, 29, 30];       // #1A1D1E
const C_GUIDE = [138, 133, 128];  // #8A8580
const C_BLUEPRINT = [43, 76, 126]; // #2B4C7E
const C_STAMP = [217, 99, 30];     // #D9631E

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function ExportPDFButton({ orcamento, onValidate }: ExportPDFButtonProps) {
  const [loading, setLoading] = useState(false);

  const validationResult = validarOrcamento(
    orcamento.empresa,
    orcamento.cliente,
    orcamento.itens
  );
  const isValid = validationResult.isValid;

  const handleExport = async () => {
    if (!isValid) {
      onValidate?.(validationResult.errors);
      return;
    }
    setLoading(true);
    try {
      guardarOrcamento(orcamento);

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      let y = MARGIN; // current vertical position
      let _pageNum = 1;

      // ---- Helper: check if we need a new page ----
      const ensureSpace = (needed: number) => {
        if (y + needed > PAGE_H - MARGIN) {
          pdf.addPage();
          _pageNum++;
          y = MARGIN;
        }
      };

      // ---- Helper: draw a line ----
      const drawLine = (color: number[], width = 0.3) => {
        pdf.setDrawColor(color[0], color[1], color[2]);
        pdf.setLineWidth(width);
        pdf.line(MARGIN, y, PAGE_W - MARGIN, y);
      };

      // ---- Helper: draw text ----
      const text = (
        content: string,
        x: number,
        yOffset: number,
        size: number,
        font: string = FONT_BODY,
        bold: boolean = false,
        color: number[] = C_INK
      ) => {
        pdf.setFontSize(size);
        pdf.setFont(font, bold ? 'bold' : 'normal');
        pdf.setTextColor(color[0], color[1], color[2]);
        pdf.text(content, x, yOffset);
      };

      // ---- HEADER: Company + Orcamento info ----
      const headerH = 30;
      ensureSpace(headerH);

      // Company name (mono, bold)
      text(orcamento.empresa.nome || 'Empresa', MARGIN, y + 6, SIZE_LG, FONT_MONO, true);
      y += 10;

      // Company details
      pdf.setFontSize(SIZE_SM);
      pdf.setFont(FONT_BODY, 'normal');
      pdf.setTextColor(C_GUIDE[0], C_GUIDE[1], C_GUIDE[2]);
      if (orcamento.empresa.nif) { pdf.text(`NIF: ${orcamento.empresa.nif}`, MARGIN, y + 4); y += 5; }
      if (orcamento.empresa.morada) { pdf.text(orcamento.empresa.morada, MARGIN, y + 4); y += 5; }
      if (orcamento.empresa.telefone) { pdf.text(orcamento.empresa.telefone, MARGIN, y + 4); y += 5; }
      if (orcamento.empresa.email) { pdf.text(orcamento.empresa.email, MARGIN, y + 4); y += 5; }

      // Orcamento number + date (right side)
      const rightX = PAGE_W - MARGIN;
      const headerTopY = MARGIN;
      pdf.setFontSize(SIZE_MD);
      pdf.setFont(FONT_MONO, 'bold');
      pdf.setTextColor(C_INK[0], C_INK[1], C_INK[2]);
      pdf.text(orcamento.numero, rightX, headerTopY + 5, { align: 'right' });
      pdf.setFontSize(SIZE_SM);
      pdf.setFont(FONT_BODY, 'normal');
      pdf.setTextColor(C_GUIDE[0], C_GUIDE[1], C_GUIDE[2]);
      pdf.text(`Data: ${formatDate(orcamento.dataEmissao)}`, rightX, headerTopY + 10, { align: 'right' });
      pdf.text(`Válido por ${orcamento.validadeDias} dias`, rightX, headerTopY + 15, { align: 'right' });

      // Horizontal rule
      y = Math.max(y, MARGIN + headerH - 5);
      drawLine(C_GUIDE, 0.5);
      y += 5;

      // ---- CLIENT BOX ----
      const clientBoxH = 25;
      ensureSpace(clientBoxH + 8);

      pdf.setDrawColor(C_GUIDE[0], C_GUIDE[1], C_GUIDE[2]);
      pdf.setLineWidth(0.3);
      pdf.rect(MARGIN, y, CONTENT_W, clientBoxH);
      y += 5;
      text('DESTINATÁRIO', MARGIN + 3, y, SIZE_XS, FONT_MONO, false, C_GUIDE);
      y += 5;
      text(orcamento.cliente.nome || '—', MARGIN + 3, y, SIZE_SM, FONT_BODY, true);
      y += 5;
      pdf.setFontSize(SIZE_SM);
      pdf.setFont(FONT_BODY, 'normal');
      pdf.setTextColor(C_GUIDE[0], C_GUIDE[1], C_GUIDE[2]);
      if (orcamento.cliente.nif) { pdf.text(`NIF: ${orcamento.cliente.nif}`, MARGIN + 3, y); y += 4; }
      if (orcamento.cliente.morada) { pdf.text(orcamento.cliente.morada, MARGIN + 3, y); y += 4; }
      if (orcamento.cliente.email) {
        const emailWrapped = pdf.splitTextToSize(orcamento.cliente.email, CONTENT_W - 6);
        pdf.text(emailWrapped, MARGIN + 3, y);
        y += 4 * emailWrapped.length;
      }
      y += 8;

      // ---- ITEMS TABLE ----
      const rowH = 7;
      const colDescW = CONTENT_W * 0.45;
      const colNumW = CONTENT_W * 0.1;
      const colPriceW = CONTENT_W * 0.2;
      const colNumX = MARGIN + colDescW;
      const colPriceX = colNumX + colNumW;
      const colTotalX = colPriceX + colPriceW;

      // Table header
      ensureSpace(rowH + 4);
      pdf.setDrawColor(C_GUIDE[0], C_GUIDE[1], C_GUIDE[2]);
      pdf.setLineWidth(0.5);
      pdf.line(MARGIN, y, PAGE_W - MARGIN, y);
      y += 5;
      text('#', MARGIN + 2, y, SIZE_XS, FONT_MONO, false, C_GUIDE);
      text('DESCRIÇÃO', MARGIN + 8, y, SIZE_XS, FONT_MONO, false, C_GUIDE);
      text('QTD.', colNumX, y, SIZE_XS, FONT_MONO, false, C_GUIDE);
      text('PREÇO UNIT.', colPriceX, y, SIZE_XS, FONT_MONO, false, C_GUIDE);
      text('SUBTOTAL', colTotalX, y, SIZE_XS, FONT_MONO, false, C_GUIDE);
      y += 4;
      pdf.setLineWidth(0.3);
      pdf.line(MARGIN, y, PAGE_W - MARGIN, y);
      y += 3;

      // Table rows
      const subtotal = calcularSubtotalItens(orcamento.itens);
      orcamento.itens.forEach((item, idx) => {
        const itemSubtotal = item.quantidade * item.precoUnitario;

        // Calculate actual row height based on description text wrapping
        const descLines = pdf.splitTextToSize(item.descricao || '—', colDescW - 10);
        const itemRowH = Math.max(rowH, descLines.length * 4.5);
        const totalItemH = itemRowH + 3; // row height + padding

        // Check if we need a new page BEFORE drawing the row
        if (y + totalItemH > PAGE_H - MARGIN) {
          pdf.addPage();
          pageNum++;
          y = MARGIN;
        }

        text(`${idx + 1}`, MARGIN + 2, y + 4, SIZE_SM, FONT_MONO);
        pdf.setFontSize(SIZE_SM);
        pdf.setFont(FONT_BODY, 'normal');
        pdf.setTextColor(C_INK[0], C_INK[1], C_INK[2]);
        pdf.text(descLines, MARGIN + 8, y + 4);

        // Right-aligned numbers at the TOP of the row, with small right margin
        const numY = y + 4;
        const numMargin = 2; // small right margin
        pdf.setFontSize(SIZE_SM);
        pdf.setFont(FONT_MONO, 'normal');
        pdf.setTextColor(C_INK[0], C_INK[1], C_INK[2]);
        pdf.text(String(item.quantidade), colNumX + colNumW - numMargin, numY, { align: 'right' });
        pdf.text(formatCurrency(item.precoUnitario), colPriceX + colPriceW - numMargin, numY, { align: 'right' });
        pdf.setFont(FONT_MONO, 'bold');
        pdf.text(formatCurrency(itemSubtotal), PAGE_W - MARGIN - numMargin, numY, { align: 'right' });

        y += totalItemH;
      });

      // ---- SUMMARY ----
      y += 3;
      const totalFinal = calcularTotalFinal(orcamento);
      const valorMargem = totalFinal - subtotal - orcamento.custoMateriais;

      const summaryH = 20 + (orcamento.custoMateriais > 0 ? 5 : 0) + (orcamento.margemPercentagem > 0 ? 5 : 0);
      ensureSpace(summaryH + 8);
      drawLine(C_GUIDE, 0.5);
      y += 6;

      const summaryRightX = PAGE_W - MARGIN - 2;

      text('Subtotal itens', MARGIN, y, SIZE_SM, FONT_MONO, false, C_GUIDE);
      text(formatCurrency(subtotal), summaryRightX, y, SIZE_SM, FONT_MONO, false, C_INK);
      y += 5;

      if (orcamento.custoMateriais > 0) {
        text('Custo de materiais', MARGIN, y, SIZE_SM, FONT_MONO, false, C_GUIDE);
        text(formatCurrency(orcamento.custoMateriais), summaryRightX, y, SIZE_SM, FONT_MONO, false, C_INK);
        y += 5;
      }

      if (orcamento.margemPercentagem > 0) {
        text(`Margem (${orcamento.margemPercentagem}%)`, MARGIN, y, SIZE_SM, FONT_MONO, false, C_GUIDE);
        text(formatCurrency(valorMargem), summaryRightX, y, SIZE_SM, FONT_MONO, false, C_INK);
        y += 5;
      }

      // ---- STAMP (Total) ----
      y += 4;
      const stampH = 28;
      ensureSpace(stampH + 10);

      const stampX = MARGIN;
      const stampW = CONTENT_W;
      // Double border
      pdf.setDrawColor(C_BLUEPRINT[0], C_BLUEPRINT[1], C_BLUEPRINT[2]);
      pdf.setLineWidth(0.8);
      pdf.rect(stampX, y, stampW, stampH);
      pdf.setLineWidth(0.3);
      pdf.rect(stampX + 2, y + 2, stampW - 4, stampH - 4);

      // "TOTAL" label
      text('T O T A L', PAGE_W / 2, y + 10, SIZE_XS, FONT_MONO, false, C_GUIDE);

      // Total value
      pdf.setFontSize(SIZE_XL);
      pdf.setFont(FONT_MONO, 'bold');
      pdf.setTextColor(C_STAMP[0], C_STAMP[1], C_STAMP[2]);
      pdf.text(formatCurrency(totalFinal), PAGE_W / 2, y + 22, { align: 'center' });

      y += stampH + 10;

      // ---- VALIDITY NOTE ----
      ensureSpace(10);
      pdf.setFontSize(SIZE_SM);
      pdf.setFont(FONT_MONO, 'normal');
      pdf.setTextColor(C_GUIDE[0], C_GUIDE[1], C_GUIDE[2]);
      pdf.text(
        `Proposta válida por ${orcamento.validadeDias} dias a partir de ${formatDate(orcamento.dataEmissao)}.`,
        PAGE_W / 2, y, { align: 'center' }
      );
      y += 10;

      // ---- NOTES ----
      if (orcamento.notas) {
        ensureSpace(20);
        drawLine(C_GUIDE, 0.3);
        y += 5;
        text('NOTAS', MARGIN, y, SIZE_XS, FONT_MONO, false, C_GUIDE);
        y += 5;
        pdf.setFontSize(SIZE_SM);
        pdf.setFont(FONT_BODY, 'normal');
        pdf.setTextColor(C_INK[0], C_INK[1], C_INK[2]);
        // Split notes by line and render each with a simple indent
        const noteLines = orcamento.notas.split('\n').filter(l => l.trim());
        noteLines.forEach((line) => {
          ensureSpace(5);
          pdf.text(`  ${line.trim()}`, MARGIN, y);
          y += 5;
        });
      }

      // ---- PAGE NUMBERS ----
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(SIZE_XS);
        pdf.setFont(FONT_MONO, 'normal');
        pdf.setTextColor(C_GUIDE[0], C_GUIDE[1], C_GUIDE[2]);
        pdf.text(`Página ${i} de ${totalPages}`, PAGE_W / 2, PAGE_H - 7, { align: 'center' });
      }

      // ---- SAVE ----
      const nomeCliente = orcamento.cliente.nome || 'sem-cliente';
      const safeName = nomeCliente.replace(/[^a-zA-Z0-9À-ÿ\s-]/g, '').trim();
      const filename = `orcamento-${orcamento.numero}-${safeName}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Erro ao gerar PDF. Veja o console para detalhes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleExport}
        disabled={loading || !isValid}
        className={`
          bg-blueprint text-paper font-mono text-sm uppercase tracking-wider
          py-3 px-6 border-0 cursor-pointer transition-all duration-200
          ${!isValid ? 'opacity-40 cursor-not-allowed bg-guide' : ''}
          ${loading ? 'opacity-60 cursor-wait' : 'hover:text-stamp'}
        `}
      >
        {loading ? 'A gerar PDF...' : 'Exportar PDF'}
      </button>
      {!isValid && (
        <p className="text-xs text-stamp font-mono text-center max-w-md">
          {Object.values(validationResult.errors).join('. ')}
        </p>
      )}
    </div>
  );
}
