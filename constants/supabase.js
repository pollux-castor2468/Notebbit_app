// constants/Supabase.js
import { createClient } from '@supabase/supabase-js'

// 這是從 .env 讀取進來的
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)