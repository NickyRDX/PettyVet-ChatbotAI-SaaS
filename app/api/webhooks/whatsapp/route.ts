export async function GET(req: Request) {
  // 1. Obtenemos los parámetros que vienen en la URL
  const { searchParams } = new URL(req.url);

  // 2. Extraemos los datos que nos manda Meta
  const mode = searchParams.get("hub.mode");
  const verifyToken = searchParams.get("hub.verify_token");
  const challenge  = searchParams.get("hub.challenge");

  // 3. Obtenemos nuestro token privado desde .env
  const token = process.env.WHATSAPP_VERIFY_TOKEN;

  // 4. Verificamos que nuestro servidor tenga configurado el token
  if (!token) {
    return Response.json(
      {
        success: false,
        message: "Token de verificación no configurado",
      },
      {
        status: 500,
      },
    );
  }

  // 5. Comparamos el token que llegó con nuestro token
  if (verifyToken !== token) {
    return Response.json(
      {
        success: false,
        message: "Token de verificación inválido",
      },
      {
        status: 403,
      },
    );
  }

  // 6. Si llegamos hasta acá, la verificación del token fue correcta
  //
  // ¿Qué es `new`?
  // Pensá en `Response` como un MOLDE de galletitas. El molde no es una galletita,
  // es la forma para fabricarlas. La palabra `new` significa "usá el molde y
  // fabricame una galletita nueva". Cada vez que escribís `new Response(...)`
  // creás una respuesta nueva, lista para mandarle a quien te llamó (Meta).
  // Ya lo usaste arriba: `new URL(req.url)` fabrica un objeto URL a partir de un texto.
  //
  // ¿Qué va adentro de los paréntesis?
  //   1) `challenge` → el CONTENIDO de la respuesta (lo que va "adentro del sobre").
  //      Meta te mandó un número secreto en `hub.challenge` y quiere que se lo
  //      devuelvas tal cual. Es como un profe que dice "repetí esta palabra":
  //      si la repetís bien, sabe que sos vos y que estás escuchando.
  //   2) `{ status: 200 }` → la ETIQUETA del sobre. 200 significa "todo OK".
  //      (403 = "no te dejo pasar", 500 = "se me rompió algo a mí").
  //
  // ¿Por qué acá `new Response` y no `Response.json` como en los otros casos?
  // `Response.json(...)` es un atajo que convierte tu objeto en JSON: le mandaría
  // a Meta algo como `"123456"` con comillas y formato JSON. Meta quiere el número
  // PELADO, como texto plano: 123456. `new Response(challenge)` manda exactamente
  // eso, sin transformarlo. Si le devolvés otra cosa, Meta no activa el webhook.
  //
  // ¿Cómo lo podés usar a futuro?
  //   - Texto plano:   new Response("hola", { status: 200 })
  //   - Sin contenido: new Response(null, { status: 204 })  // "recibido, nada que decir"
  //   - Con headers:   new Response("<h1>Hola</h1>", {
  //                      status: 200,
  //                      headers: { "Content-Type": "text/html" },
  //                    })
  // Regla simple: si querés mandar JSON, usá `Response.json(...)`;
  // si querés mandar cualquier otra cosa tal cual, usá `new Response(...)`.
  return new Response(challenge, {
    status: 200,
  });
}
// export async function POST(req : Request) {

// }
