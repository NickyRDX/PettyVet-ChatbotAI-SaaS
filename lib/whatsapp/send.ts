import type { SendMessageWhatsappInput, SendMessageWhatsappOutput } from "@/interface/send.interface";
import { formatearNumero } from "./formatear";
import { CODIGO_META_TOKEN_VENCIDO, MetaApiError } from "./errores";
const whatsappAccessToken = process.env.WHATSAPP_ACCESS_TOKEN;
const whatsappApiVersion = process.env.WHATSAPP_API_VERSION;
// Validamos que la API key y la API version estén definidas
export async function sendMessageWhatsapp(input: SendMessageWhatsappInput): Promise<SendMessageWhatsappOutput> {
   if (!whatsappAccessToken) {
     throw new Error("WHATSAPP_ACCESS_TOKEN no está definido");
   }
   if (!whatsappApiVersion) {
     throw new Error("WHATSAPP_API_VERSION no está definido");
   }
   const url = `https://graph.facebook.com/${whatsappApiVersion}/${input.phoneNumberId}/messages`;
   const body = {
      messaging_product: "whatsapp",
      to: formatearNumero(input.to),
      type: "text",
      text: {
         body: input.texto
      }
   }
   const respuesta = await fetch(url, {
      method: "POST",
      headers: {
         "Authorization": `Bearer ${whatsappAccessToken}`,
         "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
   })
   // Si Meta devuelve algo que no es JSON, `.catch` evita que ese fallo tape el error real.
   const datos = await respuesta.json().catch(() => ({}));
   if (!respuesta.ok) {
      const errorMeta = new MetaApiError({
         status: respuesta.status,
         codigo: datos.error?.code,
         detalle: datos.error?.error_data?.details,
         fbtraceId: datos.error?.fbtrace_id,
         mensaje: datos.error?.message,
      });
      // Un token vencido deja al bot sin poder responder: se registra con una frase fija para buscarla en los logs.
      if (errorMeta.codigo === CODIGO_META_TOKEN_VENCIDO) {
         console.error("ALERTA TOKEN DE META VENCIDO O INVALIDO (código 190):", errorMeta.message);
      }
      throw errorMeta;
   }
   return {
      wamid: datos.messages[0].id
   }
}