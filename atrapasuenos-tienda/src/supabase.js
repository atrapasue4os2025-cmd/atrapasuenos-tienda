import { createClient } from '@supabase/supabase-js';

// Estas líneas leen las llaves que guardamos en tu archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Creamos y exportamos la conexión oficial
export const supabase = createClient(supabaseUrl, supabaseKey);