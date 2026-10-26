import { z } from "zod";
export const WhatsAppMessageSchema = z.object({
  from: z.string(),
  id: z.string(),
  timestamp: z.string(),
  type: z.string(),
  text: z.object({
    body: z.string(),
  }).optional(),
});
export const WhatsAppWebhookSchema = z.object({
  object: z.string(),
  entry: z.array(
    z.object({
      id: z.string(),
      changes: z.array(
        z.object({
          field: z.string(),
          value: z.object({
            messaging_product: z.string(),
            metadata: z.object({
              display_phone_number: z.string(),
              phone_number_id: z.string(),
            }),
            messages: z.array(WhatsAppMessageSchema).optional(),
            // NUEVO: nombre del perfil de WhatsApp del cliente. Va en `value`, hermano de `messages`.
            // Todo es opcional: los avisos de estado de entrega no traen contactos y hay usuarios sin nombre.
            contacts: z
              .array(z.object({ profile: z.object({ name: z.string().optional() }).optional() }))
              .optional(),
          }),
        }),
      ),
    }),
  ),
});
