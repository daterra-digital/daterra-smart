import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn(
    '[DATERRA Smart] Configuração Supabase ausente. Funcionalidades online limitadas.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-daterra.supabase.co',
  supabasePublishableKey || 'placeholder-anon-key-daterra',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  }
);