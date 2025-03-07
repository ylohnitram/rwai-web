import { createClient } from "@supabase/supabase-js"

// Kontrola, zda jsou proměnné prostředí definovány
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Vytvoření klienta pouze pokud jsou k dispozici potřebné proměnné
let supabase: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn("Supabase URL or Anon Key not available. Using mock client.")
}

// Funkce pro bezpečné získání Supabase klienta
export function getSupabaseClient() {
  if (!supabase) {
    // Místo vyhození chyby vrátíme "mock" klienta, který nic nedělá
    return createMockClient()
  }
  return supabase
}

// Vytvoření "mock" klienta pro případ, že Supabase není nakonfigurován
function createMockClient() {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
        error: null,
      }),
      signInWithPassword: async () => ({ data: null, error: { message: "Supabase not configured" } }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
        }),
      }),
    }),
  } as unknown as ReturnType<typeof createClient>
}

// Pro zpětnou kompatibilitu
export { supabase }

