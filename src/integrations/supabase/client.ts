import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wbexdrnxqkugvtcmdwze.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlYmV4ZHJueHFrdWd2dGNtZHd6ZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzA5NzU1NTc4LCJleHAiOjIwMjUzMzE1Nzh9.Ks1gvNxWoHVhKuMoNxV_Qs0IWHAjwZF7-V_ZwQUPHwc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);