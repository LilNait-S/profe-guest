import { z } from "zod"

// Schema: define qué variables se necesitan y su formato válido
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
})

// Tipo inferido automáticamente del schema (no hay que mantenerlo a mano)
type Env = z.infer<typeof envSchema>

// Cache: evita re-validar cada vez que se accede a una variable
let _env: Env | null = null

// Lee process.env, valida contra el schema y cachea el resultado
export function getEnv(): Env {
  if (_env) return _env

  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    console.error("❌ Variables de entorno inválidas:", errors)
    throw new Error(
      "Variables de entorno faltantes o inválidas. Revisa .env.local",
    )
  }

  _env = parsed.data
  return _env
}

// Proxy lazy: permite usar env.VARIABLE directamente sin que explote al importar.
// La validación se ejecuta solo cuando se accede por primera vez a una propiedad.
export const env = new Proxy({} as Env, {
  get(_, prop: string) {
    return getEnv()[prop as keyof Env]
  },
})
