// Lógica de sesión que corre en el proxy, antes de que se dibuje cualquier página.
// Hace dos cosas: (1) renueva el "ticket" (cookie de sesión) y (2) saca a /login a quien no tiene sesión
// y pide una página privada. Es un chequeo "optimista": lee la cookie, no consulta la base.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Páginas que exigen sesión. Cubren también todo lo que cuelga de ellas (ej. /panel/turnos).
// Hoy todavía no existen: se agregan acá a medida que se crean.
const RUTAS_PRIVADAS = ["/panel", "/alta-clinica"];

export async function updateSession(request: NextRequest) {
  // Respuesta de base: "dejá pasar el pedido". Si hay cookies para renovar, setAll la reemplaza.
  let supabaseResponse = NextResponse.next({ request });

  // A diferencia de lib/supabase/server.ts, acá las cookies salen del pedido (request), no de cookies().
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        // Supabase lee la sesión actual del pedido.
        getAll() {
          return request.cookies.getAll();
        },
        // Se llama solo cuando hay una sesión nueva o renovada.
        setAll(cookiesToSet, headers) {
          // 1) Al pedido, para que las páginas que se dibujen después vean el ticket ya renovado
          //    (si no, intentarían renovarlo ellas y no pueden escribir cookies).
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          // 2) Se rehace la respuesta con el pedido actualizado.
          supabaseResponse = NextResponse.next({ request });
          // 3) Al navegador, para que reemplace el ticket viejo.
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          // 4) Encabezados anti-caché: evitan que una CDN guarde la respuesta y filtre la sesión a otra persona.
          Object.entries(headers).forEach(([clave, valor]) =>
            supabaseResponse.headers.set(clave, valor),
          );
        },
      },
    },
  );

  // Verifica el token de la cookie y, si venció, lo renueva (esto dispara setAll).
  // Tiene que ir ANTES de cualquier otra cosa que use la respuesta.
  // data es null si no hay sesión o la cookie es inválida (por ejemplo una vieja).
  const { data } = await supabase.auth.getClaims();
  const haySesion = Boolean(data?.claims);

  const ruta = request.nextUrl.pathname;
  // Coincide con /panel y con /panel/lo-que-sea, pero no con /panelxyz.
  const esPrivada = RUTAS_PRIVADAS.some(
    (privada) => ruta === privada || ruta.startsWith(`${privada}/`),
  );

  // Ruta privada y sin sesión: se manda a /login.
  if (esPrivada && !haySesion) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redireccion = NextResponse.redirect(url);
    // Se copian las cookies y encabezados de la respuesta de Supabase; si no, se pierde el ticket renovado.
    supabaseResponse.cookies.getAll().forEach((cookie) => redireccion.cookies.set(cookie));
    ["cache-control", "expires", "pragma"].forEach((encabezado) => {
      const valor = supabaseResponse.headers.get(encabezado);
      if (valor) redireccion.headers.set(encabezado, valor);
    });
    return redireccion;
  }

  // Siempre se devuelve la ÚLTIMA respuesta armada por setAll: es la que trae las cookies renovadas.
  return supabaseResponse;
}
