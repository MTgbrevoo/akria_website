import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://khizcgryvscakouefofc.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoaXpjZ3J5dnNjYWtvdWVmb2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTE3MDcsImV4cCI6MjA4ODk2NzcwN30.CkiSKYrfkKxi4WOXopqVMLSNV4HroqN_2kQgRogjj40";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
