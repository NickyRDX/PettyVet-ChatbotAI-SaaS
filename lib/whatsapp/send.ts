import type { SendMessageWhatsappInput, SendMessageWhatsappOutput } from "@/interface/send.interface";
import { formatearNumero } from "./formatear";
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
   const datos = await respuesta.json();
   if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status}: ${datos.error?.message}`);
   }
   return {
      wamid: datos.messages[0].id
   }
}