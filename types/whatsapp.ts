export type WhatsAppMessage = {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text: {
    body: string;
  };
};
export type WhatsAppWebhook = {
  object: string;
  entry: {
    id: string;
    changes: {
      field: string;
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        messages?: WhatsAppMessage[];
        // NUEVO: espejo en TypeScript de `contacts` del schema de Zod (mismo nivel que `messages`).
        contacts?: { profile?: { name?: string } }[];
      };
    }[];
  }[];
};
