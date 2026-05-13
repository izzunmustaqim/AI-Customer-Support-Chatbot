import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Map Q1-Q10 to EECA assessment categories
const ASSESSMENT_CATEGORIES = [
  { key: 'q1', label: 'Facility Type', field: 'Facility classification and EECA applicability' },
  { key: 'q2', label: 'EECA Awareness', field: 'Understanding of EECA requirements' },
  { key: 'q3', label: 'REM Appointment', field: 'Registered Energy Manager status' },
  { key: 'q4', label: 'Energy Audit Readiness', field: 'Energy audit compliance status' },
  { key: 'q5', label: 'EE&C Plan', field: 'Energy efficiency plan readiness' },
  { key: 'q6', label: 'Monitoring & Reporting', field: '12-month energy data readiness' },
  { key: 'q7', label: 'Staff Training', field: 'Energy awareness training programs' },
  { key: 'q8', label: 'Equipment & Technology', field: 'Equipment efficiency and EnMS status' },
  { key: 'q9', label: 'Renewable Energy', field: 'Renewable energy initiatives' },
  { key: 'q10', label: 'Management Commitment', field: 'Leadership and policy commitment' },
];

interface ReportData {
  userName: string;
  userDesignation: string | null;
  userEmail: string;
  totalScore: number;
  readinessBand: string;
  qScores: number[];
  completedAt: string;
  aiAnalysis?: string;
}

function getStatusLabel(score: number): string {
  if (score >= 8) return 'Strong';
  if (score >= 6) return 'Adequate';
  if (score >= 4) return 'Partial';
  if (score >= 2) return 'Weak';
  return 'Critical Gap';
}

function getBandLabel(band: string): string {
  switch (band) {
    case 'High': return 'READY';
    case 'Moderate': return 'MODERATE READINESS';
    case 'Low': return 'LOW READINESS';
    case 'Critical': return 'SEVERE GAP';
    default: return band.toUpperCase();
  }
}

/**
 * Build a branded EECA Compliance Readiness Preliminary Report PDF
 * following the Sandhurst Advisory report template structure.
 */
export function buildReportPDF(data: ReportData): Buffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 20; // margin
  const cw = pw - m * 2; // content width
  let y = m;

  const checkPage = (space: number) => {
    if (y + space > ph - 25) {
      doc.addPage();
      y = m;
    }
  };

  const dateStr = new Date(data.completedAt).toLocaleDateString('en-MY', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const refId = `EECA-SA-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  // ═══════════════════════════════════════════
  // PAGE 1: COVER PAGE
  // ═══════════════════════════════════════════
  doc.setFillColor(30, 27, 75);
  doc.rect(0, 0, pw, ph, 'F');

  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SANDHURST ADVISORY SDN BHD', pw / 2, 50, { align: 'center' });

  // Title
  doc.setFontSize(26);
  doc.text('EECA Compliance Readiness', pw / 2, 80, { align: 'center' });
  doc.setFontSize(22);
  doc.text('Preliminary Assessment Report', pw / 2, 92, { align: 'center' });

  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(196, 181, 253);
  doc.text(
    'A self-assessment evaluation of compliance readiness positioning',
    pw / 2, 108, { align: 'center' }
  );
  doc.text(
    'under the Energy Efficiency and Conservation Act 2024.',
    pw / 2, 114, { align: 'center' }
  );

  // Divider line
  doc.setDrawColor(139, 92, 246);
  doc.setLineWidth(0.5);
  doc.line(m + 30, 128, pw - m - 30, 128);

  // Info fields
  const infoStartY = 145;
  const labelX = m + 25;
  const valueX = pw / 2 + 5;
  doc.setFontSize(10);

  const infoFields = [
    ['Prepared For', data.userName],
    ['Respondent', `${data.userName}${data.userDesignation ? `, ${data.userDesignation}` : ''}`],
    ['Prepared By', 'Sandhurst Advisory'],
    ['Date of Report', dateStr],
    ['Reference No.', refId],
  ];

  infoFields.forEach(([label, value], i) => {
    const iy = infoStartY + i * 14;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(196, 181, 253);
    doc.text(`${label}:`, labelX, iy);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(value, valueX, iy);
  });

  // Powered by footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(139, 92, 246);
  doc.text('Powered by: Enerlytic Intelligence', pw / 2, ph - 25, { align: 'center' });

  // ═══════════════════════════════════════════
  // PAGE 2: EXECUTIVE SUMMARY
  // ═══════════════════════════════════════════
  doc.addPage();
  y = m;

  // Section header helper
  const sectionHeader = (num: string, title: string) => {
    checkPage(20);
    doc.setFillColor(30, 27, 75);
    doc.rect(m, y, cw, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${num}. ${title}`, m + 4, y + 7);
    y += 14;
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
  };

  sectionHeader('1', 'Executive Summary');

  // Executive summary text
  const execLines = doc.splitTextToSize(
    'This Preliminary Assessment Report provides a high-level overview of your facility\'s current readiness position concerning the upcoming requirements of the Energy Efficiency and Conservation Act (EECA). The analysis is derived from the self-reported parameters provided during the EECA Compliance & Readiness Checklist assessment.',
    cw
  );
  doc.text(execLines, m, y);
  y += execLines.length * 5 + 6;

  // Readiness score visual
  checkPage(45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 27, 75);
  doc.text('Overall EECA Readiness Status', m, y);
  y += 8;

  // Score bar background
  const barWidth = cw;
  const barHeight = 12;
  const bands = [
    { label: 'Severe Gap (0-39)', color: [156, 39, 176] as [number, number, number], start: 0, end: 39 },
    { label: 'Low (40-59)', color: [244, 67, 54] as [number, number, number], start: 40, end: 59 },
    { label: 'Moderate (60-79)', color: [255, 152, 0] as [number, number, number], start: 60, end: 79 },
    { label: 'Ready (80-100)', color: [76, 175, 80] as [number, number, number], start: 80, end: 100 },
  ];

  bands.forEach((band) => {
    const x = m + (band.start / 100) * barWidth;
    const w = ((band.end - band.start + 1) / 100) * barWidth;
    doc.setFillColor(band.color[0], band.color[1], band.color[2]);
    doc.rect(x, y, w, barHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(band.label, x + w / 2, y + barHeight / 2 + 2, { align: 'center' });
  });

  // Score marker
  const markerX = m + (data.totalScore / 100) * barWidth;
  doc.setFillColor(30, 27, 75);
  doc.triangle(markerX - 3, y + barHeight + 2, markerX + 3, y + barHeight + 2, markerX, y + barHeight, 'F');
  y += barHeight + 8;

  // Score display
  doc.setFillColor(245, 243, 255);
  doc.roundedRect(m, y, cw, 18, 3, 3, 'F');
  doc.setTextColor(30, 27, 75);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Score: ${data.totalScore} / 100`, m + 8, y + 8);

  // Band badge
  const bandColor = bands.find(b => data.totalScore >= b.start && data.totalScore <= b.end);
  if (bandColor) {
    doc.setFillColor(bandColor.color[0], bandColor.color[1], bandColor.color[2]);
    doc.roundedRect(pw - m - 55, y + 3, 50, 12, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(getBandLabel(data.readinessBand), pw - m - 30, y + 11, { align: 'center' });
  }
  y += 26;

  // Overall Summary (AI-generated or default)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 27, 75);
  doc.text('Overall Summary:', m, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);

  const defaultSummary = data.totalScore >= 80
    ? 'Your facility demonstrates strong readiness across most EECA compliance areas. Minor refinements may be needed in specific categories to achieve full regulatory alignment.'
    : data.totalScore >= 60
    ? 'Your facility demonstrates a baseline understanding of the EECA requirements with certain elements already initiated. However, critical structural gaps remain in formal data readiness, systemic Energy Management System (EnMS) deployment, and definitive audit signoffs.'
    : data.totalScore >= 40
    ? 'Your facility shows limited readiness for EECA compliance. Significant gaps exist across multiple compliance areas requiring urgent attention to avoid regulatory penalties.'
    : 'Your facility has severe compliance gaps that present significant regulatory risk. Immediate action is required across nearly all EECA compliance areas.';

  const summaryLines = doc.splitTextToSize(defaultSummary, cw);
  doc.text(summaryLines, m, y);
  y += summaryLines.length * 4.5 + 8;

  // ═══════════════════════════════════════════
  // SECTION 2: RESPONSE SUMMARY & GAP ANALYSIS
  // ═══════════════════════════════════════════
  sectionHeader('2', 'Response Summary & Gap Analysis');

  // Status table
  const statusBody = ASSESSMENT_CATEGORIES.map((cat, i) => [
    cat.label,
    getStatusLabel(data.qScores[i]),
    `${data.qScores[i]} / 10`,
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  autoTable(doc, {
    startY: y,
    head: [['Assessment Category', 'Current Status', 'Score']],
    body: statusBody,
    margin: { left: m, right: m },
    styles: { fontSize: 8.5, cellPadding: 3.5, textColor: [50, 50, 50] },
    headStyles: { fillColor: [30, 27, 75], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 247, 255] },
    columnStyles: { 2: { halign: 'center', fontStyle: 'bold' } },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didParseCell: (hookData: any) => {
      if (hookData.section === 'body' && hookData.column.index === 1) {
        const val = hookData.cell.text[0];
        if (val === 'Strong' || val === 'Adequate') hookData.cell.styles.textColor = [76, 175, 80];
        else if (val === 'Partial') hookData.cell.styles.textColor = [255, 152, 0];
        else hookData.cell.styles.textColor = [244, 67, 54];
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = ((doc as any).lastAutoTable?.finalY || y + 80) + 8;

  // Major & Moderate Gaps
  const severeGaps = data.qScores
    .map((s, i) => ({ score: s, cat: ASSESSMENT_CATEGORIES[i] }))
    .filter(g => g.score < 4);

  const moderateGaps = data.qScores
    .map((s, i) => ({ score: s, cat: ASSESSMENT_CATEGORIES[i] }))
    .filter(g => g.score >= 4 && g.score < 7);

  if (severeGaps.length > 0) {
    checkPage(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(244, 67, 54);
    doc.text('Major Gaps Identified (Severe Risk):', m, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    severeGaps.forEach(g => {
      checkPage(8);
      doc.setFillColor(244, 67, 54);
      doc.circle(m + 2, y + 1, 1, 'F');
      const line = doc.splitTextToSize(`${g.cat.label}: ${g.cat.field} — scored ${g.score}/10`, cw - 8);
      doc.text(line, m + 6, y + 2);
      y += line.length * 4.5 + 2;
    });
    y += 4;
  }

  if (moderateGaps.length > 0) {
    checkPage(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 152, 0);
    doc.text('Moderate Gaps Identified:', m, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    moderateGaps.forEach(g => {
      checkPage(8);
      doc.setFillColor(255, 152, 0);
      doc.circle(m + 2, y + 1, 1, 'F');
      const line = doc.splitTextToSize(`${g.cat.label}: ${g.cat.field} — scored ${g.score}/10`, cw - 8);
      doc.text(line, m + 6, y + 2);
      y += line.length * 4.5 + 2;
    });
    y += 4;
  }

  // ═══════════════════════════════════════════
  // SECTION 3: RECOMMENDATION OF ACTIONS
  // ═══════════════════════════════════════════
  checkPage(40);
  sectionHeader('3', 'Recommendation of Implementation Actions');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const recIntro = doc.splitTextToSize(
    'To bridge the compliance gaps identified in your self-assessment, the following framework categorizes the mandatory EECA requirements. Your facility\'s engineering and management teams may utilize this structured workspace to outline specific, assignable action plans.',
    cw
  );
  doc.text(recIntro, m, y);
  y += recIntro.length * 4.5 + 4;

  // Recommendations table
  const recBody = ASSESSMENT_CATEGORIES.map((cat, i) => {
    const score = data.qScores[i];
    const status = getStatusLabel(score);
    let action = 'Maintain current standards and continuous improvement.';
    if (score < 4) action = 'Immediate corrective action required. Engage compliance advisor.';
    else if (score < 7) action = 'Develop action plan to address identified gaps within 3–6 months.';
    return [cat.label, `${status} (${score}/10)`, action];
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  autoTable(doc, {
    startY: y,
    head: [['EECA Category', 'Identified Gap / Status', 'Recommended Action Plan']],
    body: recBody,
    margin: { left: m, right: m },
    styles: { fontSize: 8, cellPadding: 3.5, textColor: [50, 50, 50] },
    headStyles: { fillColor: [30, 27, 75], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 247, 255] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35 }, 1: { cellWidth: 35 } },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = ((doc as any).lastAutoTable?.finalY || y + 80) + 10;

  // ═══════════════════════════════════════════
  // SECTION 4: AI DETAILED ANALYSIS (if available)
  // ═══════════════════════════════════════════
  if (data.aiAnalysis) {
    checkPage(30);
    sectionHeader('4', 'Detailed Compliance Analysis');

    const paragraphs = data.aiAnalysis.split('\n');
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) { y += 3; continue; }

      const clean = trimmed
        .replace(/\*\*/g, '')
        .replace(/###\s*/g, '')
        .replace(/##\s*/g, '')
        .replace(/#\s*/g, '');

      if (!clean.trim()) continue;

      if (trimmed.startsWith('#')) {
        checkPage(12);
        y += 3;
        doc.setFillColor(139, 92, 246);
        doc.rect(m, y - 3, 2, 8, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 27, 75);
        doc.text(clean, m + 5, y + 3);
        y += 10;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(9);
        continue;
      }

      if (clean.startsWith('-') || clean.startsWith('•') || clean.match(/^\d+\./)) {
        checkPage(8);
        const bulletText = clean.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '');
        const splitLines = doc.splitTextToSize(bulletText, cw - 10);
        doc.setFillColor(139, 92, 246);
        doc.circle(m + 2, y + 1.5, 1, 'F');
        doc.text(splitLines, m + 6, y + 2);
        y += splitLines.length * 4.5 + 2;
        continue;
      }

      checkPage(8);
      doc.setFontSize(9);
      const splitLines = doc.splitTextToSize(clean, cw);
      doc.text(splitLines, m, y + 2);
      y += splitLines.length * 4.5 + 2;
    }
    y += 6;
  }

  // ═══════════════════════════════════════════
  // SECTION 5: PARTNERING WITH SANDHURST
  // ═══════════════════════════════════════════
  checkPage(50);
  const partnerSection = data.aiAnalysis ? '5' : '4';
  sectionHeader(partnerSection, 'Partnering with Sandhurst Advisory');

  const partnerText = doc.splitTextToSize(
    'Achieving compliance under the Energy Efficiency and Conservation Act (EECA) can be complex, but you do not have to navigate it alone. Sandhurst Advisory is ready to support your organization through every step of your EECA compliance journey.',
    cw
  );
  doc.text(partnerText, m, y);
  y += partnerText.length * 4.5 + 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const services = [
    'Compliance Advisory: Strategic consulting to clarify applicability and legal requirements.',
    'Comprehensive Energy Audits: Full-scope assessments conducted by Registered Energy Auditors (REAs).',
    'EnMS Training & Establishment: Policy design, target setting, and full implementation of Energy Management Systems.',
    'Real-Time Monitoring Services: Advanced data aggregation and IoT telemetry for continuous performance tracking.',
  ];

  services.forEach(s => {
    checkPage(10);
    doc.setFillColor(139, 92, 246);
    doc.circle(m + 2, y + 1.5, 1, 'F');
    const lines = doc.splitTextToSize(s, cw - 10);
    doc.text(lines, m + 6, y + 2);
    y += lines.length * 4.5 + 2;
  });

  y += 4;
  checkPage(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 27, 75);
  doc.text('Contact Sandhurst Advisory today to ensure seamless compliance.', m, y);
  y += 10;

  // ═══════════════════════════════════════════
  // DISCLAIMER
  // ═══════════════════════════════════════════
  checkPage(30);
  doc.setFillColor(245, 243, 255);
  doc.roundedRect(m, y, cw, 30, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Disclaimer', m + 4, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const disclaimer = doc.splitTextToSize(
    'This report is based solely on the information provided through the EECA Compliance & Readiness Self-Check tool. It is intended as a preliminary advisory document only and does not constitute legal confirmation of compliance status, formal regulatory determination, or professional certification under the Energy Efficiency and Conservation Act 2024. Sandhurst Advisory takes no liability for this report as it is an auto-generated self-assessment. User discretion is strictly required, and formal consultation is recommended for definitive compliance mapping.',
    cw - 8
  );
  doc.text(disclaimer, m + 4, y + 10);

  // ═══════════════════════════════════════════
  // FOOTERS ON ALL PAGES
  // ═══════════════════════════════════════════
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i === 1) continue; // Skip cover page footer
    doc.setFillColor(30, 27, 75);
    doc.rect(0, ph - 12, pw, 12, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(196, 181, 253);
    doc.text(
      `Sandhurst Advisory × Enerlytic Intelligence | EECA Preliminary Assessment Report | Ref: ${refId}`,
      m, ph - 5
    );
    doc.text(`Page ${i} of ${totalPages}`, pw - m - 15, ph - 5);
  }

  return Buffer.from(doc.output('arraybuffer'));
}
