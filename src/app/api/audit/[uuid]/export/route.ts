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
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    // 2. Generate PDF using native Node logic (Vercel compatible)
    const pdfBuffer = await generateAuditPDF(
      data.audit_result,
      data.ai_summary,
      data.audit_input?.company || 'Your Company',
      data.audit_input?.email || ''
    );

    // 3. Return PDF response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="SpendLens_Audit_${uuid.slice(0, 8)}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error('[pdf-export] Unhandled error:', err);
    return NextResponse.json(
      { error: 'Internal server error', message: err.message },
      { status: 500 }
    );
  }
}
