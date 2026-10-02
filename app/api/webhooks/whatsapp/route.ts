import type { WhatsAppWebhook } from "@/types/whatsapp";
import { WhatsAppWebhookSchema } from "@/esquemas/whatsapp";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/generated/prisma/client";
export async function GET(req: Request) {
  // 1. Obtenemos los parámetros que vienen en la URL
  const { searchParams } = new URL(req.url);

  // 2. Extraemos los datos que nos manda Meta
  const mode = searchParams.get("hub.mode");
  const verifyToken = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

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
// Type --> describir
// Zod --> validar
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // const message = body.entry[0].changes[0].value.messages[0].text.body
    // console.log("Mensaje recibido:", message)
    const resultados = WhatsAppWebhookSchema.safeParse(body);
    if (!resultados.success) {
      return Response.json(
        {
          success: false,
          message: "Payload de WhatsApp inválido",
          errors: resultados.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }
    const datosValidados: WhatsAppWebhook = resultados.data;
    const mensajes = datosValidados.entry[0].changes[0].value.messages;
    if (!mensajes || mensajes.length === 0) {
      return Response.json(
        {
          success: true,
          message: "Evento recibido sin mensajes para procesar",
        },
        {
          status: 200,
        },
      );
    }
    const phoneNumberId =
      datosValidados.entry[0].changes[0].value.metadata.phone_number_id;
    const clinicaPrisma = await prisma.clinica.findUnique({
      where: {
        metaPhoneNumberId: phoneNumberId,
      },
    });
    console.log("clinicaPrisma", clinicaPrisma);
    if (!clinicaPrisma) {
      return Response.json(
        {
          success: false,
          message: "Clínica no encontrada",
        },
        { status: 404 },
      );
    }
    const telefonoFrom = mensajes[0].from;
    console.log("telefono esta Aqui --->" , telefonoFrom);
    if (!telefonoFrom || telefonoFrom.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Telefono no se encuentra",
        },
        { status: 400 },
      );
    }
    const clientePrisma = await prisma.cliente.findUnique({
      where: {
        clinicaId_telefono: {
          clinicaId: clinicaPrisma.id,
          telefono: telefonoFrom
        }
      }
    })
    // Patrón "buscar o crear": queremos terminar SIEMPRE con un cliente en mano.
    //
    // ¿Por qué `let` y no `const`?
    // `const` no deja reasignar: una vez que la variable apunta a un valor, no se
    // le puede poner otro (`cliente = ...` daría error). `let` sí deja reasignar.
    // Acá la necesitamos porque `cliente` puede arrancar con un valor y terminar con otro:
    //   - Si el cliente YA existía → `clientePrisma` es el objeto del cliente, y
    //     `cliente` se queda con ese valor (el `if` no se ejecuta).
    //   - Si NO existía → `findUnique` devolvió `null`, entonces `cliente` arranca
    //     en `null`, entra al `if` y se REASIGNA con el cliente recién creado.
    //
    // Tipos: `clientePrisma` es `Cliente | null`, por eso `cliente` también lo es.
    // Después del `if`, TypeScript sabe que `cliente` ya no puede ser `null`
    // (o ya existía, o lo acabamos de crear), así que desde acá es `Cliente`.
    //
    // Ojo: `clientePrisma` NO cambia; sigue valiendo `null` si no existía.
    // El valor actualizado está solo en `cliente`.
    let cliente = clientePrisma;
    console.log("cliente: ", cliente);
    // `!cliente` es true cuando `cliente` es `null` → el cliente no existe todavía.
    if (!cliente) {
      // Lo creamos en la base y guardamos el resultado en la MISMA variable `cliente`.
      // `await` espera a que Prisma termine de insertar y devuelva el registro creado.
      cliente = await prisma.cliente.create({
        data: {
          clinicaId: clinicaPrisma.id,
          telefono: telefonoFrom
        }
      })
      return Response.json({
        success: true,
        message: "Cliente creado correctamente",
        data: cliente
      },
      {
        status: 201,
      },
    );
    }
    return Response.json(
      {
        success: true,
        message: "La petición se procesó correctamente.",
        data: cliente,
      },
      {
        status: 200,
      },
    );
  } catch (e: unknown) {
    console.error("Error al procesar el webhook de WhatsApp", e);
    if( e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"){
      return Response.json(
        {
          success: false,
          message: "El telefono ya esta registrado",
        },
        { status: 409 },
      );
    }
    return Response.json(
      {
        success: false,
        message: "Error al procesar el webhook de WhatsApp",
        error: e,
      },
      {
        status: 500,
      },
    );
  }
}
