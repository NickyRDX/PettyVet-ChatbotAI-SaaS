import crypto from "node:crypto";
export function firmarMensaje(cuerpoCrudo: string, headerFirma: string | null, secreto: string | undefined) {
   if (!secreto || !headerFirma) {
      return false;
   }
   const hash = crypto.createHmac('sha256', secreto).update(cuerpoCrudo).digest('hex')
   const firmaEsperada = `sha256=${hash}`;
   const bufferEsperado = Buffer.from(firmaEsperada)
   const bufferRecibido = Buffer.from(headerFirma)
   if(bufferEsperado.length !== bufferRecibido.length) {
      return false;
   }
   return crypto.timingSafeEqual(bufferEsperado, bufferRecibido)
}