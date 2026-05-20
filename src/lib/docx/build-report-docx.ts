import PizZip from 'pizzip';
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
  phoneNo: string | null;
  totalScore: number;
  readinessBand: string;
  qScores: number[];
  completedAt: string;
  aiAnalysis?: string;
  /** User's actual answers keyed by q1…q10, sourced from the messages table */
  questionResponses?: Record<string, string>;
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

// --- Fix #5: Cache template file in module scope (read once, reuse) ---
let cachedTemplate: Buffer | null = null;

function loadTemplate(): Buffer {
  if (cachedTemplate) return cachedTemplate;

  const templatePath = path.join(process.cwd(), 'EECA Compliance Readiness Preliminary Report.docx');
  try {
    cachedTemplate = fs.readFileSync(templatePath);
    return cachedTemplate;
  } catch {
    console.error('[Report] Template file not found at:', templatePath);
    throw new Error('Report template file not found. Ensure "EECA Compliance Readiness Preliminary Report.docx" exists in project root.');
  }
}

/**
 * Fix #1: Strip XML tags that Word inserts inside placeholders.
 * Word often splits "[Client Company Name]" across multiple <w:r> runs like:
 *   <w:r><w:t>[Client</w:t></w:r><w:r><w:t> Company Name]</w:t></w:r>
 * This function merges the visible text within each paragraph's <w:r> runs
 * so that the placeholder appears as one continuous string for matching.
 */
function mergeXmlRuns(xml: string): string {
  // Match each paragraph (<w:p>...</w:p>) and merge split runs within it
  return xml.replace(/<w:p[ >][\s\S]*?<\/w:p>/g, (paragraph) => {
    // Extract all <w:t> text content from this paragraph
    const textParts: string[] = [];
    const textRegex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
    let match;
    while ((match = textRegex.exec(paragraph)) !== null) {
      textParts.push(match[1]);
    }

    const fullText = textParts.join('');

    // Only merge if the paragraph contains a bracket placeholder
    if (!fullText.includes('[') && !fullText.includes('Score:')) {
      return paragraph;
    }

    // Rebuild: keep the first <w:r> with the full merged text, remove text from subsequent runs
    let firstRunFound = false;
    let textIndex = 0;

    return paragraph.replace(/<w:r>[\s\S]*?<\/w:r>|<w:r [\s\S]*?<\/w:r>/g, (run) => {
      // Check if this run contains <w:t> (text content)
      const hasText = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/.test(run);
      if (!hasText) return run; // Keep non-text runs (e.g. formatting only)

      if (!firstRunFound) {
        firstRunFound = true;
        // Replace the text in the first run with the full merged text
        return run.replace(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/, `<w:t xml:space="preserve">${fullText}</w:t>`);
      } else {
        // Remove text from subsequent runs (keep the run for formatting if needed, but clear text)
        return run.replace(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/, '<w:t xml:space="preserve"></w:t>');
      }
    });
  });
}

/**
 * Fix #4: Convert newlines to Word XML line breaks.
 * In OOXML, a line break is <w:br/> inside a <w:r> run.
 */
function newlinesToWordBreaks(text: string): string {
  return text.replace(/\n/g, '</w:t><w:br/><w:t xml:space="preserve">');
}

/**
 * Escape XML special characters for safe insertion into OOXML.
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Build an EECA Compliance Readiness Report in DOCX format
 * using the Sandhurst Advisory template.
 */
export async function buildReportDOCX(data: ReportData): Promise<Buffer> {
  // Fix #5: Use cached template
  const templateContent = loadTemplate();

  const zip = new PizZip(templateContent);

  // Process the document XML to merge split runs before templating
  const docXml = zip.file('word/document.xml');
  if (!docXml) {
    throw new Error('Invalid DOCX template: word/document.xml not found');
  }

  let xmlContent = docXml.asText();

  // Fix #1: Merge split XML runs so placeholders are continuous strings
  xmlContent = mergeXmlRuns(xmlContent);

  // --- Fix #6: Validate qScores length ---
  if (!data.qScores || data.qScores.length < 10) {
    console.error(`[Report] Expected 10 qScores but got ${data.qScores?.length || 0}. Padding with 0s.`);
    const padded = [...(data.qScores || [])];
    while (padded.length < 10) padded.push(0);
    data.qScores = padded;
  }

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

  // Build score breakdown using actual user answers from the messages table
  const qr = data.questionResponses || {};

  // Build replacement map for bracketed placeholders
  const replacements: Record<string, string> = {
    // Cover page
    '[Client Company Name]': data.userName,
    '[Email]': data.userEmail,
    '[Phone No]': data.phoneNo || '',
    '[Job Title]': data.userDesignation || '',
    '[Date]': dateStr,
    'EECA-SA-[AutoID]': refId,
    '[AutoID]': refId.replace('EECA-SA-', ''),

    // Executive summary
    'Score: 65 / 100': `Score: ${data.totalScore} / 100`,
    'MODERATE READINESS': getBandLabel(data.readinessBand).split(' (')[0],

    // Section 2: Response Summary & Gap Analysis — "Current Status / Input" column
    // These match the EXACT placeholder text in the DOCX template
    '[Industrial / Commercial]': qr.q1 || getStatusLabel(data.qScores[0]),
    '[Applicable / Not Sure / Exempt]': qr.q2 || getStatusLabel(data.qScores[1]),
    '[Complete / Partial / Missing]': qr.q3 || getStatusLabel(data.qScores[2]),
    '[Appointed / In Progress / None]': qr.q4 || getStatusLabel(data.qScores[3]),
    '[Implemented / Partial / None]': qr.q5 || getStatusLabel(data.qScores[4]),
    '[Q6 Elements]': qr.q6 || getStatusLabel(data.qScores[5]),
    '[Q7 Elements]': qr.q7 || getStatusLabel(data.qScores[6]),
    '[Ready / Gaps Exist / Not Ready]': qr.q8 || getStatusLabel(data.qScores[7]),
    '[Completed / Pending REA / None]': qr.q9 || getStatusLabel(data.qScores[8]),
    '[Ready / Partial / Not Ready]': qr.q10 || getStatusLabel(data.qScores[9]),

    // // Gap analysis — Section 2 bottom
    // 'A Registered Energy Manager (REM) has not yet been formally appointed.':
    //   severeGaps.length > 0
    //     ? severeGaps.map(g => `${g.cat.label} (${g.score}/10): ${g.cat.field}`).join('\n')
    //     : 'No severe gaps identified.',
    // 'Energy audit readiness is incomplete and requires a Registered Energy Auditor (REA) full scope review.':
    //   severeGaps.length > 1
    //     ? severeGaps.slice(1).map(g => `${g.cat.label} (${g.score}/10): ${g.cat.field}`).join('\n')
    //     : '',
    // 'The Energy Management System (EnMS) is not yet fully established across all required levels.':
    //   moderateGaps.length > 0
    //     ? moderateGaps.map(g => `${g.cat.label} (${g.score}/10): ${g.cat.field}`).join('\n')
    //     : 'No moderate gaps identified.',

    // // Section 4: Recommendation table
    // '[Auto-filled] e.g., No formal REM appointed.': `${getStatusLabel(data.qScores[3])} (${data.qScores[3]}/10)`,
    // '[Auto-filled] e.g., Partial policies.': `${getStatusLabel(data.qScores[4])} (${data.qScores[4]}/10)`,
    // '[Auto-filled] e.g., Data not finalized.': `${getStatusLabel(data.qScores[7])} (${data.qScores[7]}/10)`,
    // '[Auto-filled] e.g., Pending REA sign-off.': `${getStatusLabel(data.qScores[8])} (${data.qScores[8]}/10)`,

    // // Executive summary — overall summary paragraph
    // 'Your facility demonstrates a baseline understanding of the EECA requirements with certain elements already initiated. However, critical structural gaps remain in formal data readiness, systemic Energy Management System (EnMS) deployment, and definitive audit signoffs.':
    //   data.aiAnalysis
    //     ? data.aiAnalysis.replace(/[#*]/g, '').substring(0, 2000)
    //     : getDefaultSummary(data.totalScore),
  };

  // --- Fix #7: Regex-based replacement for score line (handles any default score in template) ---
  xmlContent = xmlContent.replace(
    /Score:\s*\d+\s*\/\s*100/g,
    `Score: ${data.totalScore} / 100`
  );

  // Apply replacements directly to XML content
  let unmatchedCount = 0;
  for (const [placeholder, replacement] of Object.entries(replacements)) {
    // Skip the score placeholder — already handled by regex above
    if (placeholder === 'Score: 65 / 100') continue;

    // Fix #4: Convert \n to Word line breaks, then escape XML
    const safeReplacement = newlinesToWordBreaks(escapeXml(replacement));

    // Fix #2: Use replaceAll instead of replace
    if (xmlContent.includes(placeholder)) {
      xmlContent = xmlContent.replaceAll(placeholder, safeReplacement);
    } else {
      // Try with XML-escaped version of the placeholder
      const escapedPlaceholder = escapeXml(placeholder);

      if (xmlContent.includes(escapedPlaceholder)) {
        xmlContent = xmlContent.replaceAll(escapedPlaceholder, safeReplacement);
      } else {
        // Fix #8: Log when a placeholder is not found
        unmatchedCount++;
        console.warn(`[Report] Placeholder not found in template: "${placeholder.substring(0, 60)}..."`);
      }
    }
  }

  if (unmatchedCount > 0) {
    console.warn(`[Report] ${unmatchedCount} placeholder(s) were not found in the template.`);
  }

  // Update the document.xml with replacements
  zip.file('word/document.xml', xmlContent);

  // Fix #9: Generate directly from PizZip — no redundant Docxtemplater render
  const output = zip.generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });

  return output;
}
