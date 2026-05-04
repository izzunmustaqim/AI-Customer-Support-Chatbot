'use client';

import { jsPDF } from 'jspdf';

/**
 * Generate a PDF report from the AI's final assessment text.
 * Runs entirely in the browser — no server call needed.
 */
export function generateReportPDF(reportText: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // --- Helper: check if we need a new page ---
  const checkNewPage = (requiredSpace: number) => {
    if (y + requiredSpace > pageHeight - 25) {
      doc.addPage();
      y = margin;
    }
  };

  // --- Header background ---
  doc.setFillColor(30, 27, 75); // dark purple
  doc.rect(0, 0, pageWidth, 45, 'F');

  // --- Header text ---
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('EECA Compliance & Readiness', margin, 18);
  doc.setFontSize(14);
  doc.text('Assessment Report', margin, 26);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Prepared by: Sandhurst Advisory`, margin, 35);
  doc.text(`Date: ${new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, 40);

  y = 55;

  // --- Parse and render report content ---
  doc.setTextColor(30, 30, 30);
  const lines = reportText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      y += 3;
      continue;
    }

    // Remove markdown artifacts
    const clean = trimmed
      .replace(/\*\*/g, '')
      .replace(/###\s*/g, '')
      .replace(/##\s*/g, '')
      .replace(/\[OPTION\].*?\[\/OPTION\]/g, '')
      .replace(/\[CHECKBOX\].*?\[\/CHECKBOX\]/g, '');

    if (!clean.trim()) continue;

    // Section headers
    if (trimmed.startsWith('##') || trimmed.startsWith('###') ||
        clean.match(/^\d+\.\s+(Readiness Score|Score Breakdown|Gap Analysis|Recommended|Further)/i)) {
      checkNewPage(12);
      y += 4;
      doc.setFillColor(139, 92, 246); // purple accent
      doc.rect(margin, y - 3, 2, 8, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 27, 75);
      doc.text(clean, margin + 5, y + 3);
      y += 10;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 30, 30);
      continue;
    }

    // Score highlight
    if (clean.match(/\/\s*100/)) {
      checkNewPage(16);
      doc.setFillColor(245, 243, 255);
      doc.roundedRect(margin, y - 2, contentWidth, 12, 2, 2, 'F');
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(139, 92, 246);
      doc.text(clean, margin + 4, y + 6);
      y += 16;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(10);
      continue;
    }

    // Bullet points
    if (clean.startsWith('-') || clean.startsWith('•')) {
      checkNewPage(8);
      doc.setFontSize(10);
      const bulletText = clean.replace(/^[-•]\s*/, '');
      const splitLines = doc.splitTextToSize(bulletText, contentWidth - 10);
      doc.setFillColor(139, 92, 246);
      doc.circle(margin + 2, y + 1.5, 1, 'F');
      doc.text(splitLines, margin + 6, y + 2);
      y += splitLines.length * 5 + 2;
      continue;
    }

    // Table rows (pipe-separated)
    if (clean.includes('|') && !clean.match(/^[\s|:-]+$/)) {
      checkNewPage(8);
      const cells = clean.split('|').filter(c => c.trim());
      if (cells.length >= 2) {
        doc.setFontSize(9);
        const isHeader = clean.includes('Q#') || clean.includes('Question');
        if (isHeader) {
          doc.setFillColor(139, 92, 246);
          doc.rect(margin, y - 2, contentWidth, 7, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setFillColor(248, 247, 255);
          doc.rect(margin, y - 2, contentWidth, 7, 'F');
          doc.setTextColor(30, 30, 30);
          doc.setFont('helvetica', 'normal');
        }
        const colWidth = contentWidth / cells.length;
        cells.forEach((cell, i) => {
          doc.text(cell.trim().substring(0, 30), margin + i * colWidth + 2, y + 3);
        });
        y += 8;
        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'normal');
        continue;
      }
    }

    // Skip table separator lines
    if (clean.match(/^[\s|:-]+$/)) continue;

    // Regular text
    checkNewPage(8);
    doc.setFontSize(10);
    const splitLines = doc.splitTextToSize(clean, contentWidth);
    doc.text(splitLines, margin, y + 2);
    y += splitLines.length * 5 + 2;
  }

  // --- Footer ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(245, 243, 255);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      'Sandhurst Advisory × Enerlytic Intelligence | EECA Assessment Report',
      margin,
      pageHeight - 7
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin - 20,
      pageHeight - 7
    );
  }

  // --- Download ---
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`EECA_Assessment_Report_${dateStr}.pdf`);
}
