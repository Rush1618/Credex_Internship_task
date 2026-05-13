import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { generateAuditPDF } from '@/lib/pdf-generator';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;
  const supabase = getSupabaseClient(true);

  try {
    // 1. Fetch audit data
    const { data, error } = await supabase
      .from('audits')
      .select('audit_result, ai_summary, audit_input')
      .eq('uuid', uuid)
      .single();

    if (error || !data) {
      console.error('[pdf-export] Audit not found or query error:', error);
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    console.log('[pdf-export] Found audit data for uuid:', uuid);
    
    // Safety check for audit_result format
    let auditResult = data.audit_result;
    if (typeof auditResult === 'string') {
      try {
        auditResult = JSON.parse(auditResult);
      } catch {
        console.error('[pdf-export] Failed to parse audit_result JSON string');
      }
    }

    // 2. Generate PDF using native Node logic (Vercel compatible)
    const pdfBuffer = await generateAuditPDF(
      auditResult,
      data.ai_summary,
      data.audit_input?.company || 'Your Company',
      data.audit_input?.email || ''
    );

    // 3. Return PDF response — convert Buffer to Uint8Array for NextResponse BodyInit compatibility
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Audit_Report_${uuid.slice(0, 8)}.pdf"`,
      },
    });
  } catch (err) {
    const error = err as Error;
    console.error('[pdf-export] Unhandled error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        raw: JSON.stringify(error, Object.getOwnPropertyNames(error))
      },
      { status: 500 }
    );
  }
}
