// Cliente de Supabase pensado para el servidor (no para el navegador).
import { createServerClient } from "@supabase/ssr";
// En el servidor, la sesión del usuario viaja en cookies de la petición.
import { cookies } from "next/headers";

// Dirección del proyecto. Viene del archivo .env.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Clave pública. Identifica el proyecto; no es la clave secreta.
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Arma un cliente nuevo por cada petición, con las cookies de esa petición.
export const createClient = (
  // cookieStore es la caja de cookies que Next ya leyó.
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) => {
  // El "!" dice: estas variables existen. Si faltan en .env, falla al usarse.
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      // Supabase lee aquí la sesión guardada (quién está logueado).
      getAll() {
        return cookieStore.getAll();
      },
      // Si la sesión se renueva, Supabase escribe las cookies nuevas.
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // En un Server Component no se pueden escribir cookies.
          // No pasa nada: el middleware se encarga de refrescar la sesión.
        }
      },
    },
  });
};
