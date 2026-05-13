import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jfzkvlyjuqufpusnhgkk.supabase.co';
const supabaseKey = 'sb_publishable_gtKcXlhXEbHJiHQ0cXIxMg_LtKPMZQV';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  // Try to fetch audits
  const { error } = await supabase
    .from('audits')
    .select('id')
    .limit(1);

  if (error) {
    if (error.code === 'PGRST116') {
      console.log('❌ Table "audits" not found. You need to run the SQL migration.');
    } else if (error.message.includes('API key')) {
      console.log('❌ Invalid API key. Please check your Supabase dashboard.');
    } else {
      console.log('❌ Supabase error:', error.message);
    }
  } else {
    console.log('✅ Connected to "audits" table successfully!');
  }

  // Try to fetch leads
  const { error: leadError } = await supabase
    .from('leads')
    .select('id')
    .limit(1);

  if (leadError) {
    if (leadError.code === 'PGRST116') {
      console.log('❌ Table "leads" not found.');
    }
  } else {
    console.log('✅ Connected to "leads" table successfully!');
  }
}

testConnection();
