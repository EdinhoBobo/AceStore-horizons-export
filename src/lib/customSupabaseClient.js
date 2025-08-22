import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iinluzynsppgwghsrevd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpbmx1enluc3BwZ3dnaHNyZXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MzczNTUsImV4cCI6MjA3MTQxMzM1NX0.bS3kBTd5DfySdD-j6L-ikSGCCKfbft4AF49CiUPm0Q4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);