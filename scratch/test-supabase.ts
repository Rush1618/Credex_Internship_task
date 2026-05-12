import { getSupabaseClient } from './src/lib/supabase';

async function testSupabase() {
  const supabase = getSupabaseClient(true);
  console.log('Testing Supabase connection...');
  
  const { data, error } = await supabase.from('leads').select('*').limit(1);
  
  if (error) {
    console.error('Supabase Error:', error);
  } else {
    console.log('Supabase Success! Data:', data);
  }
}

testSupabase();
