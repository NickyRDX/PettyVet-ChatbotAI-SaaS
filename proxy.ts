// proxy.ts (antes se llamaba middleware): Next lo ejecuta ANTES de dibujar cualquier página.
// Tiene que estar en la raíz del proyecto, al lado de la carpeta app.
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next llama a esta función con cada pedido que coincida con el matcher de abajo.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Dónde corre el proxy: en todo MENOS lo que está excluido (patrón "todo menos…").
// - api: tu API ya se protege sola (clave x-api-key y firma de Meta). Si el proxy la tocara,
//   mandaría a Meta a /login y el bot dejaría de recibir mensajes.
// - _next/static y _next/image: archivos internos de Next (estilos, scripts, imágenes optimizadas).
// - favicon.ico y archivos con extensión de imagen (public/): si no, se bloquearían las imágenes.
// Tiene que ser una constante: Next la analiza al compilar y no acepta variables.
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
