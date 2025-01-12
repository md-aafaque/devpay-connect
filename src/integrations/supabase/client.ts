import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Access the Supabase URL and key from environment variables
const VITE_SUPABASE_URL = "https://wbexdrnxqkugvtcmdwze.supabase.co";
const VITE_SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZXhkcm54cWt1Z3Z0Y21kd3plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4MzQyNDAsImV4cCI6MjAyNTQxMDI0MH0.PqkH2n_rs0M_nGQchJYBqFZDhB_PCXkRG9oqDKUlAYw";

export const supabase = createClient<Database>(
  VITE_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY
);