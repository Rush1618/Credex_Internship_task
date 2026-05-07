import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { auditInput, auditResult } = body;

    const uuid = uuidv4();

    const { error } = await supabase.from('audits').insert({
      uuid,
      audit_input: auditInput,
      audit_result: auditResult,
      total_monthly_savings: auditResult.totalMonthlySavings,
      total_annual_savings: auditResult.totalAnnualSavings,
    });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to save audit' }, { status: 500 });
    }

    return NextResponse.json({ uuid });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
