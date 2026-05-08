import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('DEBUG: Supabase URL is:', supabaseUrl);

export const getSupabaseClient = (useServiceRole = false) => {
  let key = useServiceRole ? supabaseServiceRoleKey : supabaseAnonKey;
  
  // Fallback to anon key if service role is placeholder
  if (useServiceRole && (!key || key === 'your_supabase_service_role_key')) {
    key = supabaseAnonKey;
  }
  
  if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url' || !supabaseUrl.startsWith('http')) {
    console.warn('Supabase URL is invalid or placeholder. Using dummy client.');
    return {
      from: () => ({
        select: () => ({ 
          eq: () => ({ single: () => ({ data: null, error: null }) }),
          order: () => ({ limit: () => ({ data: [], error: null }) }),
          head: () => ({ count: 0, error: null })
        }),
        insert: () => ({ data: null, error: null }),
      }),
    } as any;
  }

  try {
    return createClient(supabaseUrl, key);
  } catch (err) {
    console.error('Supabase createClient crashed:', err);
    return {
      from: () => ({
        select: () => ({ 
          eq: () => ({ single: () => ({ data: null, error: null }) }),
          order: () => ({ limit: () => ({ data: [], error: null }) }),
          head: () => ({ count: 0, error: null })
        }),
        insert: () => ({ data: null, error: null }),
      }),
    } as any;
  }
};
