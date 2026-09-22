import { createClient } from '@supabase/supabase-js';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Supabase client using configuration from firebase-applet-config.json
// with support for environment overrides
const supabaseUrl =
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  `https://${firebaseConfig.projectId}.supabase.co`;

const supabaseAnonKey =
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  firebaseConfig.apiKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
