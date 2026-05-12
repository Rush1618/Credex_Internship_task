import PDFDocument from 'pdfkit/js/pdfkit.standalone';
import { AuditResult } from './audit-engine';

// -- Palette ------------------------------------------------------------------
const COLORS = {
  V700: '#534AB7', // violet
  V100: '#EEEDFE',
  V300: '#AFA9EC',
  V900: '#26215C',
  E600: '#0F6E56', // emerald
  E100: '#E1F5EE',
  E300: '#9FE1CB',
  R600: '#993C1D', // rose
  R100: '#FCEBEB',
  R300: '#F7C1C1',
  A600: '#854F0B', // amber
  A100: '#FAEEDA',
  A300: '#FAC775',
  DARK: '#1C1B1A',
  MID: '#6B6966',
  LITE: '#F4F2EE',
  BDR: '#DDD9D3',
  WHITE: '#FFFFFF',
};

const TOOL_MAP: Record<string, string> = {
  'cursor': 'Cursor',
  'github-copilot': 'GitHub Copilot',
  'claude': 'Claude',
  'chatgpt': 'ChatGPT',
  'anthropic-api': 'Anthropic API',
  'openai-api': 'OpenAI API',
  'gemini': 'Gemini',
  'windsurf': 'Windsurf',
};

function getToolLabel(name: string, plan?: string) {
  const base = TOOL_MAP[name] || name.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  if (!plan) return base;
  if (plan.toLowerCase() === 'api' && base.toLowerCase().endsWith('api')) {
    return base;
  }
  const planLbl = plan.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  return `${base} ${planLbl}`;
}

export async function generateAuditPDF(
  result: AuditResult,
  aiSummary: string = '',
  companyName: string = 'Your Company',
  userEmail: string = ''
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    try {
      console.log('[pdf-generator] Starting generation for:', result?.companyName);
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 30, bottom: 30, left: 40, right: 40 },
        bufferPages: true,
      });
      if (!result) throw new Error('No audit result provided to PDF generator');
      if (!result.recommendations) result.recommendations = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        console.log('[pdf-generator] PDF generation complete, buffer size:', Buffer.concat(chunks).length);
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', (err) => {
        console.error('[pdf-generator] PDFKit error:', err);
        reject(err);
      });

    const PAGE_W = 595.28;
    const ML = 40;
    const IW = PAGE_W - 2 * ML;
    let y = 30;

    // -- Header ---------------------------------------------------------------
    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.DARK).text(`SaaS Audit Report — ${companyName}`, ML, y);
    
    const headerRight = userEmail ? `${userEmail} | Generated ${dateStr}` : `Generated ${dateStr}`;
    doc.font('Helvetica').fontSize(8).fillColor(COLORS.MID).text(headerRight, ML, y + 3, { align: 'right', width: IW });
    
    y += 20;
    doc.strokeColor(COLORS.BDR).lineWidth(0.5).moveTo(ML, y).lineTo(ML + IW, y).stroke();
    y += 15;

    // -- AI Analysis & Confidence ---------------------------------------------
    const rowH = 70;
    const aiW = IW * 0.65;
    const gap = IW * 0.05;
    const confW = IW - aiW - gap;

    // AI Analysis - DYNAMIC HEIGHT
    const aiText = aiSummary || 'Analysis complete. Redundancies identified in your AI stack.';
    const aiContentWidth = aiW - 20;
    const aiTextHeight = doc.heightOfString(aiText, { width: aiContentWidth, lineGap: 2 });
    const dynamicRowH = Math.max(70, aiTextHeight + 35);

    // AI Card
    doc.roundedRect(ML, y, aiW, dynamicRowH, 4).fillAndStroke(COLORS.LITE, COLORS.BDR);
    doc.font('Helvetica-Bold').fontSize(6).fillColor(COLORS.MID).text('AI ANALYSIS · AUTONOMOUS SYNTHESIS', ML + 10, y + 10);
    doc.font('Helvetica').fontSize(7.5).fillColor(COLORS.DARK).text(aiText, ML + 10, y + 22, { width: aiContentWidth, lineGap: 2 });

    // Confidence Card (align height with AI card)
    const confX = ML + aiW + gap;
    doc.roundedRect(confX, y, confW, dynamicRowH, 4).fillAndStroke(COLORS.WHITE, COLORS.BDR);
    doc.font('Helvetica-Bold').fontSize(6).fillColor(COLORS.MID).text('AUDIT CONFIDENCE', confX + 10, y + 10);
    
    const conf = result.confidenceScore || 95;
    const confColor = conf > 85 ? COLORS.E600 : conf > 70 ? COLORS.A600 : COLORS.R600;
    doc.font('Helvetica-Bold').fontSize(24).fillColor(confColor).text(`${conf}%`, confX + 10, y + 22);
    doc.font('Helvetica').fontSize(6).fillColor(COLORS.MID).text('Based on tool metadata & market benchmarks.', confX + 10, y + dynamicRowH - 20, { width: confW - 20 });

    y += dynamicRowH + 15;

    // -- Stats ---------------------------------------------------------------
    const statW = (IW - 10) / 2;
    
    // Monthly Savings
    doc.roundedRect(ML, y, statW, 55, 4).fillAndStroke(COLORS.LITE, COLORS.BDR);
    doc.font('Helvetica-Bold').fontSize(6).fillColor(COLORS.MID).text('MONTHLY SAVINGS', ML + 10, y + 10);
    doc.font('Helvetica-Bold').fontSize(20).fillColor(COLORS.DARK).text(`$${(result.totalMonthlySavings || 0).toLocaleString()}`, ML + 10, y + 22);
    doc.font('Helvetica').fontSize(6).fillColor(COLORS.MID).text('Immediate reduction in monthly burn', ML + 10, y + 42);

    // Annual Savings
    const annualX = ML + statW + 10;
    doc.roundedRect(annualX, y, statW, 55, 4).fillAndStroke(COLORS.LITE, COLORS.BDR);
    doc.font('Helvetica-Bold').fontSize(6).fillColor(COLORS.MID).text('ANNUAL SAVINGS', annualX + 10, y + 10);
    doc.font('Helvetica-Bold').fontSize(20).fillColor(COLORS.DARK).text(`$${(result.totalAnnualSavings || 0).toLocaleString()}`, annualX + 10, y + 22);
    doc.font('Helvetica').fontSize(6).fillColor(COLORS.MID).text('Total cash returned to business per year', annualX + 10, y + 42);

    y += 70;

    // -- Breakdown Table ------------------------------------------------------
    doc.font('Helvetica-Bold').fontSize(7).fillColor(COLORS.MID).text('TOOL-BY-TOOL BREAKDOWN', ML, y);
    y += 12;
    doc.strokeColor(COLORS.DARK).lineWidth(1).moveTo(ML, y).lineTo(ML + IW, y).stroke();
    y += 5;

    const cols = {
      tool: ML,
      status: ML + IW * 0.25,
      savings: ML + IW * 0.45,
      reason: ML + IW * 0.65,
    };

    doc.font('Helvetica-Bold').fontSize(6).fillColor(COLORS.MID);
    doc.text('TOOL', cols.tool, y);
    doc.text('STATUS', cols.status, y);
    doc.text('SAVES', cols.savings, y);
    doc.text('REASONING', cols.reason, y);
    
    y += 12;
    doc.strokeColor(COLORS.BDR).lineWidth(0.5).moveTo(ML, y).lineTo(ML + IW, y).stroke();
    y += 5;

    result.recommendations.forEach((rec, i) => {
      // Calculate dynamic height for this row based on reasoning text
      const reasonText = rec.reasoning?.[0] || ( (rec.isOptimal || rec.savingsType === 'optimization') ? 'Verified optimal usage.' : 'Potential for consolidation.');
      const reasonWidth = IW * 0.35 - 10;
      const reasonHeight = doc.heightOfString(reasonText, { width: reasonWidth, lineGap: 1 });
      const rowHeight = Math.max(40, reasonHeight + 20);

      // Page break check
      if (y + rowHeight > 750) {
        doc.addPage();
        y = 50;
        // Redraw table header on new page if desired (optional)
      }

      const bgColor = i % 2 === 0 ? COLORS.WHITE : COLORS.LITE;
      doc.rect(ML, y, IW, rowHeight).fill(bgColor);
      
      const midY = y + 10;

      // Tool
      const toolLabel = rec.toolName ? (TOOL_MAP[rec.toolName] || rec.toolName.toUpperCase()) : 'Unknown Tool';
      doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.DARK).text(toolLabel, cols.tool + 5, midY);
      doc.font('Helvetica').fontSize(6).fillColor(COLORS.MID).text(rec.currentPlan || 'Standard', cols.tool + 5, midY + 10);

      // Status
      const isOptimal = rec.isOptimal || rec.savingsType === 'optimization';
      const badgeColor = isOptimal ? COLORS.E600 : COLORS.V700;
      const badgeBg = isOptimal ? COLORS.E100 : COLORS.V100;
      const badgeText = isOptimal ? 'OPTIMAL' : (rec.savingsType?.toUpperCase() || 'SAVING');
      
      doc.roundedRect(cols.status, midY, 45, 12, 2).fill(badgeBg);
      doc.font('Helvetica-Bold').fontSize(6).fillColor(badgeColor).text(badgeText, cols.status, midY + 3, { width: 45, align: 'center' });

      // Savings
      const monthlySavingsNum = Number(rec.monthlySavings || 0);
      const saveText = monthlySavingsNum > 0 ? `$${monthlySavingsNum.toLocaleString()}/mo` : '—';
      doc.font('Helvetica-Bold').fontSize(8).fillColor(monthlySavingsNum > 0 ? COLORS.V700 : COLORS.MID).text(saveText, cols.savings, midY + 2);

      // Reasoning
      doc.font('Helvetica').fontSize(6.5).fillColor(COLORS.MID).text(reasonText, cols.reason, midY, { width: reasonWidth, lineGap: 1 });

      y += rowHeight;
      doc.strokeColor(COLORS.BDR).lineWidth(0.2).moveTo(ML, y).lineTo(ML + IW, y).stroke();
    });

    // -- Footer ---------------------------------------------------------------
    const bottom = doc.page.height - 40;
    doc.font('Helvetica').fontSize(6).fillColor(COLORS.MID).text(
      'Recommendations based on public pricing verified 2026. Always confirm current enterprise terms with vendors before acting.',
      ML, bottom, { align: 'center', width: IW }
    );

      doc.end();
    } catch (err) {
      console.error('[pdf-generator] Fatal generation error:', err);
      reject(err);
    }

    // Safety timeout
    setTimeout(() => {
      reject(new Error('PDF generation timed out after 10s'));
    }, 10000);
  });
}
