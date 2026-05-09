"""
exportAuditPDF v2 — fills the full A4 page, no empty space
Uses canvas-first approach for precise pixel control
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from io import BytesIO
import datetime, textwrap

PAGE_W, PAGE_H = A4          # 595.27 x 841.89 pts
ML = 13 * mm                 # left/right margin
MT = 10 * mm                 # top margin
MB = 8  * mm                 # bottom margin
IW = PAGE_W - 2 * ML        # inner usable width  ≈ 569 pts

# ── Palette ──────────────────────────────────────────────────────────────────
V700  = colors.HexColor('#534AB7')   # violet
V100  = colors.HexColor('#EEEDFE')
V300  = colors.HexColor('#AFA9EC')
V900  = colors.HexColor('#26215C')
E600  = colors.HexColor('#0F6E56')   # emerald
E100  = colors.HexColor('#E1F5EE')
E300  = colors.HexColor('#9FE1CB')
R600  = colors.HexColor('#993C1D')   # rose
R100  = colors.HexColor('#FCEBEB')
R300  = colors.HexColor('#F7C1C1')
A600  = colors.HexColor('#854F0B')   # amber
A100  = colors.HexColor('#FAEEDA')
A300  = colors.HexColor('#FAC775')
DARK  = colors.HexColor('#1C1B1A')
MID   = colors.HexColor('#6B6966')
LITE  = colors.HexColor('#F4F2EE')
BDR   = colors.HexColor('#DDD9D3')
WHITE = colors.white

# ── Canvas helpers ────────────────────────────────────────────────────────────

def rrect(c, x, y, w, h, r=3, fill=WHITE, stroke=BDR, sw=0.4):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(sw)
    c.roundRect(x, y, w, h, r, fill=1, stroke=1)

def hrule(c, x, y, w, col=BDR, sw=0.4):
    c.setStrokeColor(col)
    c.setLineWidth(sw)
    c.line(x, y, x + w, y)

def txt(c, text, x, y, size=7.5, color=DARK, font='Helvetica', align='left', max_w=None):
    c.setFont(font, size)
    c.setFillColor(color)
    if max_w:
        # manual wrap
        words = text.split()
        lines, line = [], ''
        for w in words:
            test = (line + ' ' + w).strip()
            if c.stringWidth(test, font, size) <= max_w:
                line = test
            else:
                if line:
                    lines.append(line)
                line = w
        if line:
            lines.append(line)
        lh = size * 1.35
        for i, l in enumerate(lines):
            draw_str(c, l, x, y - i * lh, size, color, font, align)
        return len(lines) * lh
    else:
        draw_str(c, text, x, y, size, color, font, align)
        return size * 1.35

def draw_str(c, text, x, y, size, color, font, align):
    c.setFont(font, size)
    c.setFillColor(color)
    if align == 'center':
        c.drawCentredString(x, y, text)
    elif align == 'right':
        c.drawRightString(x, y, text)
    else:
        c.drawString(x, y, text)

def pill(c, label, x, y, fg, bg, fs=5.5, pad_x=5, pad_y=2):
    c.setFont('Helvetica-Bold', fs)
    w = c.stringWidth(label, 'Helvetica-Bold', fs) + pad_x * 2
    h = fs + pad_y * 2
    c.setFillColor(bg)
    c.roundRect(x, y - pad_y - 1, w, h, 2, fill=1, stroke=0)
    c.setFillColor(fg)
    c.drawString(x + pad_x, y + 1, label)
    return w

def eyebrow(c, text, x, y, col=MID):
    c.setFont('Helvetica-Bold', 6)
    c.setFillColor(col)
    c.drawString(x, y, text.upper())

def label_val(c, label, value, val_size, x, y, val_col=DARK, desc=None, desc_col=MID):
    eyebrow(c, label, x, y)
    c.setFont('Helvetica-Bold', val_size)
    c.setFillColor(val_col)
    c.drawString(x, y - val_size - 2, value)
    if desc:
        c.setFont('Helvetica', 6)
        c.setFillColor(desc_col)
        c.drawString(x, y - val_size - 2 - 8, desc)
# ── Labels ───────────────────────────────────────────────────────────────────
TOOL_MAP = {
    'cursor': 'Cursor',
    'github-copilot': 'GitHub Copilot',
    'claude': 'Claude',
    'chatgpt': 'ChatGPT',
    'anthropic-api': 'Anthropic API',
    'openai-api': 'OpenAI API',
    'gemini': 'Gemini',
    'windsurf': 'Windsurf'
}

def get_tool_label(name, plan):
    base = TOOL_MAP.get(name, name.replace('-', ' ').title())
    if not plan: return base
    if plan.lower() == 'api' and base.lower().endswith('api'):
        return base # Avoid "Anthropic API Api"
    plan_lbl = plan.replace('-', ' ').title()
    return f"{base} {plan_lbl}"


# ── Main export ───────────────────────────────────────────────────────────────

def exportAuditPDF(result: dict, ai_summary: str = '', output_path: str = None, company_name: str = 'Your Company', user_email: str = '') -> bytes:

    buf = BytesIO()
    c = rl_canvas.Canvas(buf, pagesize=A4)

    recs      = result['recommendations']
    monthly   = result['totalMonthlySavings']
    annual    = result['totalAnnualSavings']
    conf      = result['confidenceScore']
    warnings  = result.get('redundancyWarnings', [])
    hi_save   = result.get('isHighSavings', False)
    bi        = result.get('benchmarkInfo')
    retain    = [r for r in recs if r.get('isOptimal') or r.get('savingsType') == 'optimization']
    action    = [r for r in recs if not r.get('isOptimal') and r.get('savingsType') != 'optimization']

    # We work top-down in PDF coords (0,0 = bottom-left)
    # Convert: screen_y_from_top → pdf_y = PAGE_H - MT - screen_y_from_top
    TOP  = PAGE_H - MT       # top baseline in pdf coords
    BODY_H = TOP - MB        # full usable height

    # ── Pre-calculate section heights so we can stretch them to fill page ────
    # Fixed heights (pts)
    H_HEADER   = 18
    H_TOP_ROW  = 62
    H_BENCH    = 44  if bi else 0
    H_PLANS    = 12 + len(retain) * 13 + 8 if retain or action else 36
    H_PLANS    = max(H_PLANS, 12 + max(len(retain), len(action)) * 13 + 8)
    H_STATS    = 52
    H_WARN     = (10 + len(warnings) * 12 + 6) if warnings else 0
    H_CTA      = 52 if hi_save else 0
    H_DISC     = 14
    H_BD_HDR   = 14

    # Breakdown: header row + each rec row
    rec_heights = []
    for r in recs:
        lines = 1
        reasoning_w = IW * 0.58 - 8
        for reason in r.get('reasoning', []):
            # rough char-per-line estimate at 7pt Helvetica (~5.5 pts/char)
            chars_per_line = int(reasoning_w / 4.0)
            lines_for_reason = max(1, (len(reason) + chars_per_line - 1) // chars_per_line)
            lines = max(lines, lines_for_reason)
        h = max(28, lines * 9 + 16)
        rec_heights.append(h)
    H_BD_ROWS = sum(rec_heights)

    fixed_total = (H_HEADER + 3 + H_TOP_ROW + 4 + H_BENCH + (4 if bi else 0)
                   + H_PLANS + 4 + H_STATS + 4
                   + H_WARN + (4 if warnings else 0)
                   + H_CTA + (4 if hi_save else 0)
                   + H_BD_HDR + H_BD_ROWS + H_DISC + 4)

    # Available slack to distribute
    slack = BODY_H - fixed_total
    # Give extra space to top row, stats, breakdown rows proportionally
    stretch_top  = slack * 0.25
    stretch_stat = slack * 0.20
    stretch_bd   = slack * 0.30
    stretch_plan = slack * 0.15
    stretch_bench= slack * 0.10

    H_TOP_ROW  += stretch_top
    H_STATS    += stretch_stat
    H_PLANS    += stretch_plan
    if bi:
        H_BENCH += stretch_bench
    # distribute remainder to breakdown rows proportionally
    if rec_heights:
        extra_per_row = stretch_bd / len(rec_heights)
        rec_heights = [h + extra_per_row for h in rec_heights]

    GAP = 4   # pts between sections

    y = TOP   # current draw cursor (pdf coords, top of next section)

    # ─── HEADER ──────────────────────────────────────────────────────────────
    date_str = datetime.date.today().strftime('%B %d, %Y')
    c.setFont('Helvetica-Bold', 11)
    c.setFillColor(DARK)
    c.drawString(ML, y - 11, f'SaaS Audit Report — {company_name}')
    c.setFont('Helvetica', 7)
    c.setFillColor(MID)
    header_right = f'Generated {date_str}'
    if user_email:
        header_right = f'{user_email} | {header_right}'
    c.drawRightString(PAGE_W - ML, y - 9, header_right)
    y -= H_HEADER

    hrule(c, ML, y, IW)
    y -= GAP

    # ─── TOP ROW: AI Summary (68%) + Confidence (30%) ────────────────────────
    ai_w  = IW * 0.67
    gap2  = IW * 0.02
    cf_w  = IW - ai_w - gap2
    row_y = y
    row_h = H_TOP_ROW

    # AI card
    rrect(c, ML, row_y - row_h, ai_w, row_h, fill=LITE, stroke=BDR)
    eyebrow(c, 'AI ANALYSIS  ·  OPENROUTER', ML + 8, row_y - 10)
    ai_text = ai_summary or 'No AI summary provided.'
    c.setFont('Helvetica', 7.2)
    c.setFillColor(MID)
    # wrap text manually
    avail = ai_w - 16
    words = ai_text.split()
    lines_ai, ln = [], ''
    for w in words:
        test = (ln + ' ' + w).strip()
        if c.stringWidth(test, 'Helvetica', 7.2) <= avail:
            ln = test
        else:
            if ln: lines_ai.append(ln)
            ln = w
    if ln: lines_ai.append(ln)
    lh = 10.5
    for i, l in enumerate(lines_ai[:int((row_h - 18) / lh)]):
        c.drawString(ML + 8, row_y - 20 - i * lh, l)

    # Confidence card
    cx = ML + ai_w + gap2
    rrect(c, cx, row_y - row_h, cf_w, row_h, fill=WHITE, stroke=BDR)
    eyebrow(c, 'AUDIT CONFIDENCE', cx + 8, row_y - 10)
    conf_col = E600 if conf > 85 else A600 if conf > 70 else R600
    c.setFont('Helvetica-Bold', 28)
    c.setFillColor(conf_col)
    c.drawString(cx + 8, row_y - row_h + 22, f'{conf}%')
    c.setFont('Helvetica', 6)
    c.setFillColor(MID)
    c.drawString(cx + 8, row_y - row_h + 10, 'Based on team size & current market pricing.')

    y -= row_h + GAP

    # ─── BENCHMARK ───────────────────────────────────────────────────────────
    if bi:
        bh = H_BENCH
        rrect(c, ML, y - bh, IW, bh, fill=WHITE, stroke=BDR)

        # Ring
        ring_cx = ML + 26
        ring_cy = y - bh / 2
        ring_r  = 16
        c.setStrokeColor(E300)
        c.setLineWidth(2)
        c.circle(ring_cx, ring_cy, ring_r, fill=0, stroke=1)
        c.setFont('Helvetica-Bold', 13)
        c.setFillColor(E600)
        pct_w = c.stringWidth(f"{bi['percentile']}%", 'Helvetica-Bold', 13)
        c.drawString(ring_cx - pct_w/2, ring_cy - 1, f"{bi['percentile']}%")
        c.setFont('Helvetica', 5.5)
        c.setFillColor(MID)
        lbl_w = c.stringWidth('pctile', 'Helvetica', 5.5)
        c.drawString(ring_cx - lbl_w/2, ring_cy - 10, 'pctile')

        # Middle text
        mx = ML + 50
        status = bi['status']
        s_fg = E600 if status == 'OPTIMAL' else R600
        s_bg = E100 if status == 'OPTIMAL' else R100
        pill(c, f'{status} SPEND', mx, y - 12, s_fg, s_bg, fs=6)
        c.setFont('Helvetica-Bold', 8)
        c.setFillColor(DARK)
        c.drawString(mx, y - 23, bi['comparisonText'])
        c.setFont('Helvetica', 7)
        c.setFillColor(MID)
        c.drawString(mx, y - 33, f"You are in the top {100 - bi['percentile']}% of efficient teams for your size.")

        # Divider
        div_x = ML + IW * 0.62
        c.setStrokeColor(BDR)
        c.setLineWidth(0.4)
        c.line(div_x, y - 8, div_x, y - bh + 8)

        # Right: potential rank
        rx = div_x + 10
        eyebrow(c, 'POTENTIAL RANK', rx, y - 12)
        c.setFont('Helvetica', 7.5)
        c.setFillColor(MID)
        c.drawString(rx, y - 23, 'Actioning these saves moves you to')
        c.setFont('Helvetica-Bold', 7.5)
        c.setFillColor(V700)
        c.drawString(rx, y - 33, 'the top 1%.')

        y -= bh + GAP

    # ─── PLAN GRID ───────────────────────────────────────────────────────────
    ph = H_PLANS
    hw = IW / 2 - 3

    # Retain card
    rrect(c, ML, y - ph, hw, ph, fill=E100, stroke=E300)
    eyebrow(c, '✓  RETAIN & OPTIMIZE', ML + 8, y - 10, col=E600)
    hrule(c, ML, y - 15, hw, col=E300, sw=0.3)
    py = y - 26
    for r in retain:
        c.setFont('Helvetica-Bold', 7.5)
        c.setFillColor(E600)
        tool_lbl = get_tool_label(r['toolName'], r.get('currentPlan'))
        c.drawString(ML + 8, py, tool_lbl)
        
        pill(c, 'OPTIMAL', ML + hw - 48, py - 4, E600, E100)
        py -= 15
    if not retain:
        c.setFont('Helvetica', 7); c.setFillColor(MID)
        c.drawString(ML + 8, py, 'No optimal tools detected.')

    # Replace card
    rx2 = ML + hw + 6
    rrect(c, rx2, y - ph, hw, ph, fill=R100, stroke=R300)
    eyebrow(c, '⚠  REPLACE OR CANCEL', rx2 + 8, y - 10, col=R600)
    hrule(c, rx2, y - 15, hw, col=R300, sw=0.3)
    py2 = y - 26
    for r in action:
        c.setFont('Helvetica-Bold', 7.5)
        c.setFillColor(R600)
        tool_lbl = get_tool_label(r['toolName'], r.get('currentPlan'))
        save_amt = r.get('monthlySavings', 0)
        c.drawString(rx2 + 8, py2, f"{tool_lbl}")
        
        c.setFont('Helvetica', 6)
        c.setFillColor(MID)
        c.drawString(rx2 + 8, py2 - 7, f"Action: save ${save_amt:,.0f}/mo")
        
        pill(c, 'ACTION', rx2 + hw - 44, py2 - 4, R600, R100)
        py2 -= 15
    if not action:
        c.setFont('Helvetica', 7); c.setFillColor(MID)
        c.drawString(rx2 + 8, py2, 'No redundant tools found.')

    y -= ph + GAP

    # ─── STATS ───────────────────────────────────────────────────────────────
    sh = H_STATS
    hw2 = IW / 2 - 3

    rrect(c, ML, y - sh, hw2, sh, fill=LITE, stroke=BDR)
    eyebrow(c, 'MONTHLY SAVINGS', ML + 8, y - 10)
    c.setFont('Helvetica-Bold', 22)
    c.setFillColor(DARK)
    c.drawString(ML + 8, y - sh + 18, f'${monthly:,.0f}')
    c.setFont('Helvetica', 6.5)
    c.setFillColor(MID)
    c.drawString(ML + 8, y - sh + 8, 'Immediate reduction in monthly burn')

    rx3 = ML + hw2 + 6
    rrect(c, rx3, y - sh, hw2, sh, fill=LITE, stroke=BDR)
    eyebrow(c, 'ANNUAL SAVINGS', rx3 + 8, y - 10)
    c.setFont('Helvetica-Bold', 22)
    c.setFillColor(DARK)
    c.drawString(rx3 + 8, y - sh + 18, f'${annual:,.0f}')
    c.setFont('Helvetica', 6.5)
    c.setFillColor(MID)
    c.drawString(rx3 + 8, y - sh + 8, 'Total cash returned to business per year')

    y -= sh + GAP

    # ─── REDUNDANCY ──────────────────────────────────────────────────────────
    if warnings:
        wh = H_WARN
        rrect(c, ML, y - wh, IW, wh, fill=A100, stroke=A300)
        eyebrow(c, '⚠  REDUNDANCY ALERTS', ML + 8, y - 10, col=A600)
        hrule(c, ML, y - 15, IW, col=A300, sw=0.3)
        wy = y - 26
        for w in warnings:
            # Wrap warning text
            c.setFont('Helvetica', 7)
            c.setFillColor(A600)
            avail_w = IW - 20
            words = w.split()
            lines, ln = [], ''
            for wd in words:
                test = (ln + ' ' + wd).strip()
                if c.stringWidth(test, 'Helvetica', 7) <= avail_w:
                    ln = test
                else:
                    if ln: lines.append(ln)
                    ln = wd
            if ln: lines.append(ln)
            
            for li, line in enumerate(lines):
                bullet = '• ' if li == 0 else '  '
                c.drawString(ML + 8, wy, f'{bullet}{line}')
                wy -= 10
            wy -= 2 # Extra gap between warnings
        y -= wh + GAP

    # ─── CTA ─────────────────────────────────────────────────────────────────
    if hi_save:
        cta_h = H_CTA
        header_h = cta_h * 0.72
        footer_h = cta_h - header_h

        # Header (violet)
        c.setFillColor(V700)
        c.roundRect(ML, y - cta_h, IW, cta_h, 4, fill=1, stroke=0)

        eyebrow(c, 'HIGH SAVINGS DETECTED', ML + 10, y - 10, col=V300)
        c.setFont('Helvetica-Bold', 9)
        c.setFillColor(WHITE)
        c.drawString(ML + 10, y - 22, f'You could save ${monthly:,.0f}/mo — Credex can capture even more.')
        c.setFont('Helvetica', 7)
        c.setFillColor(colors.HexColor('#CECBF6'))
        cta_body = ('Credex negotiates volume discounts directly with vendors. '
                    'Teams like yours unlock an additional 15–25% on top of these savings.')
        c.drawString(ML + 10, y - 32, cta_body[:90])
        if len(cta_body) > 90:
            c.drawString(ML + 10, y - 41, cta_body[90:])

        # Footer strip
        c.setFillColor(WHITE)
        c.roundRect(ML, y - cta_h, IW, footer_h, 4, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.rect(ML, y - cta_h + footer_h - 4, IW, 4, fill=1, stroke=0)
        c.setStrokeColor(V700)
        c.setLineWidth(0.4)
        c.roundRect(ML, y - cta_h, IW, cta_h, 4, fill=0, stroke=1)

        c.setFont('Helvetica', 7)
        c.setFillColor(MID)
        c.drawString(ML + 10, y - cta_h + footer_h / 2 + 2,
                     'credex.rocks/book  ·  No commitment  ·  30 minutes  ·  We do the analysis.')

        y -= cta_h + GAP

    # ─── BREAKDOWN ───────────────────────────────────────────────────────────
    eyebrow(c, 'TOOL-BY-TOOL BREAKDOWN', ML, y - 8)
    y -= H_BD_HDR
    hrule(c, ML, y, IW, sw=0.5)
    y -= 2

    # Column widths
    cw_tool  = IW * 0.17
    cw_stat  = IW * 0.11
    cw_save  = IW * 0.10
    cw_rsn   = IW - cw_tool - cw_stat - cw_save

    # Header row
    cols = ['TOOL', 'STATUS', 'SAVES', 'REASONING']
    cxs  = [ML, ML + cw_tool, ML + cw_tool + cw_stat, ML + cw_tool + cw_stat + cw_save]
    for col, cx in zip(cols, cxs):
        eyebrow(c, col, cx, y - 8)
    y -= 14
    hrule(c, ML, y, IW, col=BDR, sw=0.3)

    for ri, rec in enumerate(recs):
        rh = rec_heights[ri]
        bg = WHITE if ri % 2 == 0 else LITE
        c.setFillColor(bg)
        c.rect(ML, y - rh, IW, rh, fill=1, stroke=0)

        is_opt = rec.get('isOptimal', False)
        stype  = rec.get('savingsType', 'optimize')
        badge  = 'OPTIMAL' if is_opt else stype.upper()
        b_fg   = E600 if is_opt else V700
        b_bg   = E100 if is_opt else V100

        mid_y  = y - rh / 2

        # Tool name + plan
        c.setFont('Helvetica-Bold', 7.5)
        c.setFillColor(DARK)
        tool_display = TOOL_MAP.get(rec['toolName'], rec['toolName'].capitalize())
        c.drawString(ML + 2, mid_y + 5, tool_display)
        
        curr_p = get_tool_label(rec['toolName'], rec.get('currentPlan'))
        reco_p = get_tool_label(rec['toolName'], rec.get('recommendedPlan'))
        
        if is_opt:
            plan_text = f"Current: {curr_p}"
            plan_text2 = ""
        else:
            plan_text = f"From: {curr_p}"
            plan_text2 = f"To: {reco_p}"
            
        c.setFont('Helvetica', 6)
        c.setFillColor(MID)
        c.drawString(ML + 2, mid_y - 4, plan_text[:22])
        if plan_text2:
            c.drawString(ML + 2, mid_y - 13, plan_text2[:22])

        # Status badge
        pill(c, badge, cxs[1], mid_y - 3, b_fg, b_bg, fs=5.5)

        # Savings
        save_val = rec.get('monthlySavings', 0)
        c.setFont('Helvetica-Bold', 8)
        c.setFillColor(V700 if save_val > 0 else MID)
        c.drawString(cxs[2], mid_y - 1, f'${save_val:,.0f}/mo')

        # Reasoning — wrapped
        reasoning = rec.get('reasoning', [])
        if not reasoning:
            reasoning = ['Verified optimal tool usage.'] if is_opt else ['Optimization potential identified.']
        full_text = '  ·  '.join(reasoning)
        c.setFont('Helvetica', 6.8)
        c.setFillColor(MID)
        rx_start = cxs[3]
        avail_w = cw_rsn - 4
        words = full_text.split()
        lines_r, ln = [], ''
        for w in words:
            test = (ln + ' ' + w).strip()
            if c.stringWidth(test, 'Helvetica', 6.8) <= avail_w:
                ln = test
            else:
                if ln: lines_r.append(ln)
                ln = w
        if ln: lines_r.append(ln)
        lh_r = 9.5
        total_h_r = len(lines_r) * lh_r
        start_y_r = mid_y + total_h_r / 2 - lh_r * 0.7
        for li, l in enumerate(lines_r):
            c.drawString(rx_start, start_y_r - li * lh_r, l)

        hrule(c, ML, y - rh, IW, col=BDR, sw=0.3)
        y -= rh

    y -= GAP

    # ─── DISCLAIMER ──────────────────────────────────────────────────────────
    disc = ('Recommendations based on public pricing verified 2026-05-07. '
            'Always confirm current enterprise terms with vendors before acting.')
    c.setFont('Helvetica', 6)
    c.setFillColor(MID)
    disc_w = c.stringWidth(disc, 'Helvetica', 6)
    c.drawString(PAGE_W / 2 - disc_w / 2, MB + 2, disc)

    c.save()
    pdf_bytes = buf.getvalue()

    if output_path:
        with open(output_path, 'wb') as f:
            f.write(pdf_bytes)

    return pdf_bytes


# ── Sample ────────────────────────────────────────────────────────────────────
SAMPLE = {
    'totalMonthlySavings': 840,
    'totalAnnualSavings': 10080,
    'isHighSavings': True,
    'confidenceScore': 92,
    'redundancyWarnings': [
        'Notion and Confluence both provide team wikis — you are paying twice for the same capability.',
        'Miro and Figma whiteboard features overlap significantly for a team your size.',
    ],
    'benchmarkInfo': {
        'percentile': 72,
        'status': 'BLOATED',
        'comparisonText': "You're spending 31% more than similar teams",
    },
    'recommendations': [
        {
            'toolName': 'figma',
            'currentPlan': 'Organization (15 seats)',
            'recommendedPlan': 'Professional (8 seats)',
            'savingsType': 'downgrade',
            'monthlySavings': 420,
            'isOptimal': False,
            'reasoning': [
                'Only 8 of 15 seats were active in the last 90 days.',
                'Professional plan covers all features your team actually uses.',
            ],
        },
        {
            'toolName': 'confluence',
            'currentPlan': 'Standard (50 users)',
            'recommendedPlan': 'Cancel — consolidate into Notion',
            'savingsType': 'consolidation',
            'monthlySavings': 420,
            'isOptimal': False,
            'reasoning': [
                'Parallel wikis already maintained in Notion — no unique value added.',
                'Migration tools exist for a low-downtime move.',
            ],
        },
        {
            'toolName': 'linear',
            'currentPlan': 'Business',
            'recommendedPlan': 'Business',
            'savingsType': 'optimization',
            'monthlySavings': 0,
            'isOptimal': True,
            'reasoning': [
                '$8/seat/month is the market minimum for this tier.',
                'All 12 seats show active usage — no dormant licenses detected.',
            ],
        },
        {
            'toolName': 'slack',
            'currentPlan': 'Pro',
            'recommendedPlan': 'Pro',
            'savingsType': 'optimization',
            'monthlySavings': 0,
            'isOptimal': True,
            'reasoning': [
                'Pro plan is right-sized for 12 active members.',
                'No unused integrations or dormant channels detected.',
            ],
        },
    ],
}

if __name__ == '__main__':
    import sys
    import json
    import os

    if len(sys.argv) < 2:
        print("Usage: python exportAuditPDF.py <input_json_path> [output_pdf_path]")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else 'audit_report.pdf'

    with open(input_path, 'r') as f:
        data = json.load(f)

    exportAuditPDF(
        data['result'],
        ai_summary=data.get('ai_summary', ''),
        output_path=output_path,
        company_name=data.get('company_name', 'Your Company'),
        user_email=data.get('user_email', '')
    )

    print(f"PDF generated at: {output_path}")

