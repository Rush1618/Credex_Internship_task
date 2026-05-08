import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jfzkvlyjuqufpusnhgkk.supabase.co';
const supabaseKey = 'sb_publishable_gtKcXlhXEbHJiHQ0cXIxMg_LtKPMZQV';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('Testing public insert into "audits"...');
  
  const { data, error } = await supabase.from('audits').insert({
    uuid: '00000000-0000-0000-0000-000000000000',
    audit_input: { test: true },
    audit_result: { totalMonthlySavings: 100, recommendations: [], redundancyWarnings: [] },
    total_monthly_savings: 100,
    total_annual_savings: 1200,
    ai_summary: 'Test summary'
  });

  if (error) {
    console.log('❌ Insert failed:', error.message);
    console.log('Hint: Did you run the SQL migration and policies?');
  } else {
    console.log('✅ Insert successful! Public policies are working.');
  }
}

testInsert();
