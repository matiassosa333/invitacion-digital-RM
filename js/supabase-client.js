import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://hanmncowfnudxsjxdnkq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhhbm1uY293Zm51ZHhzanhkbmtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MzgyNzEsImV4cCI6MjA5OTAxNDI3MX0.Dluyo6mR7SHlB-3FrRMhnFHyLYdLwW4X3fMHe2FOCj0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);