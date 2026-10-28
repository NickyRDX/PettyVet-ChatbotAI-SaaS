import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import type { Clinica } from "@/generated/prisma/client";
import type { WhatsAppMessage } from "@/types/whatsapp";
import { generateRespuestaIA } from "@/lib/ai/gemini";
import { sendMessageWhatsapp } from "@/lib/whatsapp/send";
import { getInstrucciones } from "@/lib/ai/instrucciones";
const MAXIMO_CARACTERES = 1000;
const UMBRAL_MENSAJE_COLGADO_MS: number = 60000;
const MENSAJE_TIPO_NO_SOPORTADO: string =
  "Te pedimos disculpas pero actualmente no procesamos mensajes de Audio, solamente procesamos mensajes de texto";
// DATOS DE ENTRADA: lo que esta función recibe desde route.ts (ella no puede ver las variables de POST).
// - mensaje:       UN mensaje de la lista `value.messages` (route.ts lo reparte con map)
// - clinica:       la clínica que route.ts ya buscó por `phoneNumberId` (se busca una vez, no por mensaje)
// - phoneNumberId: tu número de WhatsApp, de `value.metadata.phone_number_id`; sendMessageWhatsapp lo necesita para responder
// - contactos:     la lista `value.contacts` del evento; de ahí se saca el nombre del cliente de ESTE mensaje
export async function procesarMensajes({
  mensaje,
  clinica,
  phoneNumberId,
  contactos,
}: {
  mensaje: WhatsAppMessage;
  clinica: Clinica;
  phoneNumberId: string;
  // `wa_id` es el teléfono del contacto: en el paso 4 se compara con `mensaje.from` para elegir el contacto correcto.
  contactos?: { profile?: { name?: string }; wa_id?: string }[];
}): Promise<boolean> {
  // Devuelve true si el mensaje quedó atendido (respondido, duplicado, audio, malformado) y false si falló de verdad.
  let mensajeTexto;
  const nombreMeta = contactos?.find((c) => c.wa_id === mensaje.from)?.profile
    ?.name;
  try {
    const telefonoFrom = mensaje.from;
    if (!telefonoFrom || telefonoFrom.length === 0) {
      console.warn("Teléfono no encontrado en el mensaje, wamid:", mensaje.id);
      return true;
    }
    const clientePrisma = await prisma.cliente.findUnique({
      where: {
        clinicaId_telefono: {
          clinicaId: clinica.id,
          telefono: telefonoFrom,
        },
      },
    });
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
    // `!cliente` es true cuando `cliente` es `null` → el cliente no existe todavía.
    if (!cliente) {
      // Lo creamos en la base y guardamos el resultado en la MISMA variable `cliente`.
      // `await` espera a que Prisma termine de insertar y devuelva el registro creado.
      cliente = await prisma.cliente.create({
        data: {
          clinicaId: clinica.id,
          telefono: telefonoFrom,
          nombre: nombreMeta,
        },
      });
    }
    // Ahora que saber : Esa clínica y este cliente ya tienen una conversacion?
    const conversacionPrisma = await prisma.conversacion.findUnique({
      where: {
        clinicaId_clienteId: {
          clinicaId: clinica.id,
          clienteId: cliente.id,
        },
      },
    });
    // usamos un condicional para si existe una conversacion previa o no
    let conversacion = conversacionPrisma;
    if (!conversacion) {
      conversacion = await prisma.conversacion.create({
        data: {
          clinicaId: clinica.id,
          clienteId: cliente.id,
        },
      });
    }
    // Si resulta que no encontré ningún mensaje...
    const tipoCuerpo = mensaje.type;
    const id = mensaje.id;
    // comprobar si existe id
    if (!id) {
      console.warn("No se encontró el id del mensaje");
      return true;
    }
    // verificamos si el mensaje con su id ya existe en la base de datos
    const buscarWamid = await prisma.mensaje.findUnique({
      where: {
        wamid: id,
      },
      select: {
        id: true,
        estado: true,
        createdAt: true,
      },
    });
    let mensajeWamidExistente = buscarWamid;
    if (mensajeWamidExistente) {
      if (
        mensajeWamidExistente.estado === "RECIBIDO" &&
        mensajeWamidExistente.createdAt >
          new Date(Date.now() - UMBRAL_MENSAJE_COLGADO_MS)
      ) {
        console.log(
          "Mensaje ya existe y se encuentra en estado RECIBIDO, wamid:",
          id,
        );
        return true;
      }
      if (mensajeWamidExistente.estado === "RESPONDIDO") {
        console.log(
          "Mensaje ya existe y se encuentra en estado RESPONDIDO, wamid:",
          id,
        );
        return true;
      }
    }
    // switch para verificar el tipo de mensaje texto o audio
    switch (tipoCuerpo) {
      case "text":
        if (!mensaje.text) {
          console.warn("Mensaje de tipo text sin campo text, wamid:", id);
          return true;
        }
        const cuerpo = mensaje.text.body;
        // si es texto, guardamos el mensaje en la base de datos
        if (!mensajeWamidExistente) {
          mensajeTexto = await prisma.mensaje.create({
            data: {
              clinicaId: clinica.id,
              conversacionId: conversacion.id,
              wamid: id,
              direccion: "ENTRANTE",
              estado: "RECIBIDO",
              tipo: "TEXTO",
              cuerpo: cuerpo,
            },
          });
        } else {
          mensajeTexto = await prisma.mensaje.update({
            where: {
              id: mensajeWamidExistente.id,
            },
            data: {
              estado: "RECIBIDO",
            },
          });
        }
        break;
      case "audio":

      default:
        await sendMessageWhatsapp({
          phoneNumberId: phoneNumberId,
          to: telefonoFrom,
          texto: MENSAJE_TIPO_NO_SOPORTADO,
        });
        console.log(`Tipo de mensaje no soportado actualmente: ${tipoCuerpo}`);
        return true;
    }
    const mensajeReducido = mensajeTexto.cuerpo.slice(0, MAXIMO_CARACTERES);
    const instrucciones = getInstrucciones({
      nombreClinica: clinica.nombre,
      nombreCliente: nombreMeta || "",
      mensajeActual: mensajeReducido,
      conversacionPrevia: "",
    });
    const respuestaIA = await generateRespuestaIA({ mensaje: instrucciones });
    console.log(
      "Tokens de entrada: ",
      respuestaIA.tokenEntrada,
      "Tokens de salida: ",
      respuestaIA.tokenSalida,
    );
    const envioWhatsapp = await sendMessageWhatsapp({
      phoneNumberId: phoneNumberId,
      to: telefonoFrom,
      texto: respuestaIA.texto,
    });
    const mensajeSalida = await prisma.mensaje.create({
      data: {
        clinicaId: clinica.id,
        conversacionId: conversacion.id,
        cuerpo: respuestaIA.texto,
        direccion: "SALIENTE",
        wamid: envioWhatsapp.wamid,
        tipo: "TEXTO",
        estado: "GENERADO",
      },
    });
    mensajeTexto = await prisma.mensaje.update({
      where: {
        id: mensajeTexto.id,
      },
      data: {
        estado: "RESPONDIDO",
      },
    });
    console.log("mensajeSalida: ", mensajeSalida);
    return true;
  } catch (e: unknown) {
    console.error("Error al procesar los mensajes", e);
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      console.log("Mensaje ya recibido y en proceso (P2002)");
      return true;
    }
    try {
      if (mensajeTexto) {
        await prisma.mensaje.update({
          where: {
            id: mensajeTexto.id,
          },
          data: {
            estado: "FALLIDO",
          },
        });
      }
    } catch (error: unknown) {
      console.error("Error al actualizar el estado del mensaje", error);
    }
    return false;
  }
}
