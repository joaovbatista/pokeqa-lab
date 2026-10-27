export const env = {
  supabaseUrl: (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '',
  supabaseKey: (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ?? '',
  demoMode: import.meta.env.VITE_DEMO_MODE !== 'false',
  pokeapiEnabled: import.meta.env.VITE_ENABLE_POKEAPI !== 'false',
}

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseKey)
export const STORAGE_BUCKET = 'pokeqa-uploads'
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES: readonly string[] = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
