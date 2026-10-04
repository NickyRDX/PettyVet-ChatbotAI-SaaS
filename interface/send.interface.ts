export interface SendMessageWhatsappInput {
   phoneNumberId: string;
   texto: string;
   to: string;
}
export interface SendMessageWhatsappOutput { 
   wamid: string;
}