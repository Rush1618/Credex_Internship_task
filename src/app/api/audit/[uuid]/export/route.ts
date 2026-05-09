import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

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

    // 2. Prepare payload for Python script
    const payload = {
      result: data.audit_result,
      ai_summary: data.ai_summary,
      company_name: data.audit_input?.company || 'Your Company',
      user_email: data.audit_input?.email || '',
    };


    // 3. Create temp files
    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `audit_${uuid}.json`);
    const outputPath = path.join(tempDir, `audit_${uuid}.pdf`);

    await fs.writeFile(inputPath, JSON.stringify(payload));

    // 4. Run Python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'exportAuditPDF.py');
    
    try {
      // Use 'python' or 'python3' depending on environment. 
      // On Windows it's usually 'python'.
      await execAsync(`python "${scriptPath}" "${inputPath}" "${outputPath}"`);
    } catch (execErr: any) {
      console.error('[pdf-export] Python execution failed:', execErr.message);
      return NextResponse.json(
        { error: 'PDF generation failed', detail: execErr.message },
        { status: 500 }
      );
    }

    // 5. Read generated PDF
    const pdfBuffer = await fs.readFile(outputPath);

    // 6. Cleanup temp files (async)
    fs.unlink(inputPath).catch(console.error);
    fs.unlink(outputPath).catch(console.error);

    // 7. Return PDF response
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
