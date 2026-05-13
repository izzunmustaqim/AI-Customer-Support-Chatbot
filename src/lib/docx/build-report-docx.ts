import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import * as fs from 'fs';
import * as path from 'path';

// Map Q1-Q10 to EECA assessment categories
const ASSESSMENT_CATEGORIES = [
  { label: 'Facility Type', field: 'Facility classification and EECA applicability' },
  { label: 'EECA Awareness', field: 'Understanding of EECA requirements' },
  { label: 'REM Appointment', field: 'Registered Energy Manager status' },
  { label: 'Energy Audit Readiness', field: 'Energy audit compliance status' },
  { label: 'EE&C Plan', field: 'Energy efficiency plan readiness' },
  { label: 'Monitoring & Reporting', field: '12-month energy data readiness' },
  { label: 'Staff Training', field: 'Energy awareness training programs' },
  { label: 'Equipment & Technology', field: 'Equipment efficiency and EnMS status' },
  { label: 'Renewable Energy', field: 'Renewable energy initiatives' },
  { label: 'Management Commitment', field: 'Leadership and policy commitment' },
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
    case 'High': return 'READY (80-100)';
    case 'Moderate': return 'MODERATE READINESS (60-79)';
    case 'Low': return 'LOW READINESS (40-59)';
    case 'Critical': return 'SEVERE GAP (0-39)';
    default: return band.toUpperCase();
  }
}

function getDefaultSummary(score: number): string {
  if (score >= 80)
    return 'Your facility demonstrates strong readiness across most EECA compliance areas. Minor refinements may be needed in specific categories to achieve full regulatory alignment.';
  if (score >= 60)
    return 'Your facility demonstrates a baseline understanding of the EECA requirements with certain elements already initiated. However, critical structural gaps remain in formal data readiness, systemic Energy Management System (EnMS) deployment, and definitive audit signoffs.';
  if (score >= 40)
    return 'Your facility shows limited readiness for EECA compliance. Significant gaps exist across multiple compliance areas requiring urgent attention to avoid regulatory penalties.';
  return 'Your facility has severe compliance gaps that present significant regulatory risk. Immediate action is required across nearly all EECA compliance areas.';
}

function getRecommendation(score: number): string {
  if (score >= 8) return 'Maintain current standards and continuous improvement.';
  if (score >= 6) return 'Minor improvements needed. Review and strengthen existing processes.';
  if (score >= 4) return 'Develop action plan to address identified gaps within 3-6 months.';
  return 'Immediate corrective action required. Engage compliance advisor.';
}

/**
 * Build an EECA Compliance Readiness Report in DOCX format
 * using the Sandhurst Advisory template.
 */
export async function buildReportDOCX(data: ReportData): Promise<Buffer> {
  // Load the template
  const templatePath = path.join(process.cwd(), 'EECA Compliance Readiness Preliminary Report.docx');

  let templateContent: Buffer;
  try {
    templateContent = fs.readFileSync(templatePath);
  } catch {
    console.error('[Report] Template file not found at:', templatePath);
    throw new Error('Report template file not found. Ensure "EECA Compliance Readiness Preliminary Report.docx" exists in project root.');
  }

  const zip = new PizZip(templateContent);

  // Process the document XML to merge split runs before templating
  const docXml = zip.file('word/document.xml');
  if (!docXml) {
    throw new Error('Invalid DOCX template: word/document.xml not found');
  }

  let xmlContent = docXml.asText();

  // Prepare date string
  const dateStr = new Date(data.completedAt).toLocaleDateString('en-MY', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const refId = `EECA-SA-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  // Build gap analysis text
  const severeGaps = data.qScores
    .map((s, i) => ({ score: s, cat: ASSESSMENT_CATEGORIES[i] }))
    .filter(g => g.score < 4);

  const moderateGaps = data.qScores
    .map((s, i) => ({ score: s, cat: ASSESSMENT_CATEGORIES[i] }))
    .filter(g => g.score >= 4 && g.score < 7);

  // Build replacement map for bracketed placeholders
  const replacements: Record<string, string> = {
    // Cover page
    '[Client Company Name]': data.userName,
    '[Respondent Name], [Designation]': `${data.userName}${data.userDesignation ? `, ${data.userDesignation}` : ''}`,
    '[Respondent Name]': data.userName,
    '[Designation]': data.userDesignation || '',
    '[Facility Name]': 'As per assessment',
    '[Date]': dateStr,
    'EECA-SA-[AutoID]': refId,
    '[AutoID]': refId.replace('EECA-SA-', ''),

    // Executive summary
    'Score: 65 / 100': `Score: ${data.totalScore} / 100`,
    'MODERATE READINESS': getBandLabel(data.readinessBand).split(' (')[0],

    // Status table entries
    '[Industrial / Commercial]': getStatusLabel(data.qScores[0]),
    '[Applicable / Not Sure / Exempt]': getStatusLabel(data.qScores[1]),
    '[Complete / Partial / Missing]': getStatusLabel(data.qScores[5]),
    '[Appointed / In Progress / None]': getStatusLabel(data.qScores[2]),
    '[Implemented / Partial / None]': getStatusLabel(data.qScores[7]),
    '[Ready / Gaps Exist / Not Ready]': getStatusLabel(data.qScores[4]),
    '[Completed / Pending REA / None]': getStatusLabel(data.qScores[3]),
    '[Ready / Partial / Not Ready]': getStatusLabel(data.qScores[8]),

    // Gap analysis
    'A Registered Energy Manager (REM) has not yet been formally appointed.':
      severeGaps.length > 0
        ? severeGaps.map(g => `${g.cat.label}: ${g.cat.field} — scored ${g.score}/10`).join('\n')
        : 'No severe gaps identified.',
    'Energy audit readiness is incomplete and requires a Registered Energy Auditor (REA) full scope review.':
      '',
    'The Energy Management System (EnMS) is not yet fully established across all required levels.':
      moderateGaps.length > 0
        ? moderateGaps.map(g => `${g.cat.label}: ${g.cat.field} — scored ${g.score}/10`).join('\n')
        : 'No moderate gaps identified.',

    // Recommendation table
    '[Auto-filled] e.g., No formal REM appointed.': `${getStatusLabel(data.qScores[2])} (${data.qScores[2]}/10)`,
    '[Auto-filled] e.g., Partial policies.': `${getStatusLabel(data.qScores[7])} (${data.qScores[7]}/10)`,

    // Overall summary placeholder
    '[Your facility demonstrates a baseline understanding of the EECA requirements with certain elements already initiated. However, critical structural gaps remain in formal data readiness, systemic Energy Management System (EnMS) deployment, and definitive audit signoffs.]':
      data.aiAnalysis
        ? data.aiAnalysis.replace(/[#*]/g, '').substring(0, 2000)
        : getDefaultSummary(data.totalScore),
  };

  // Apply replacements directly to XML content
  // Handle cases where brackets might be split across XML runs
  for (const [placeholder, replacement] of Object.entries(replacements)) {
    // Escape XML special characters in replacement
    const safeReplacement = replacement
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    // Try direct replacement first
    if (xmlContent.includes(placeholder)) {
      xmlContent = xmlContent.replace(placeholder, safeReplacement);
    } else {
      // Try with XML-escaped version of the placeholder
      const escapedPlaceholder = placeholder
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      if (xmlContent.includes(escapedPlaceholder)) {
        xmlContent = xmlContent.replace(escapedPlaceholder, safeReplacement);
      }
    }
  }

  // Update the document.xml with replacements
  zip.file('word/document.xml', xmlContent);

  // Generate the output
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    // Use custom delimiters that won't match anything (we already did manual replacement)
    delimiters: { start: '{{', end: '}}' },
  });

  // Render (this handles any remaining {{tag}} style placeholders)
  doc.render({});

  const output = doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });

  return output;
}
