import { prisma } from "@/lib/db/prisma";
const LIMITE_MENSAJES: number = 15;
const VENTANA_MS: number = 24 * 60 * 60 * 1000;
// Claude: renombré la función a una pregunta de sí/no y el parámetro a `conversacionId` (es un id, no una conversación).
export async function superoLimiteMensajes(
  conversacionId: string,
): Promise<boolean> {
  // Calculamos la fecha de hace exactamente 24 horas
  const fecha24hs = new Date(Date.now() - VENTANA_MS);
  const cantidadMensajeEntrante = await prisma.mensaje.count({
    where: {
      direccion: "ENTRANTE",
      conversacionId: conversacionId,
      createdAt: {
        gte: fecha24hs,
      },
    },
  });
  if (cantidadMensajeEntrante > LIMITE_MENSAJES) {
    // Claude: saqué el log de prueba de la cantidad y dejé este, con el id de la conversación para poder investigar.
    console.log(
      `Límite de ${LIMITE_MENSAJES} mensajes en 24 horas superado, conversacionId: ${conversacionId}`,
    );
    return true;
  }
  return false;
}
// Claude: ¿ya hay un entrante LIMITADO en la ventana? Si lo hay, a este cliente ya se le avisó. Se llama ANTES de marcar el mensaje actual como LIMITADO, si no se contaría a sí mismo.
export async function yaSeAvisoLimite(conversacionId: string): Promise<boolean> {
  const cantidadLimitados = await prisma.mensaje.count({
    where: {
      direccion: "ENTRANTE",
      estado: "LIMITADO",
      conversacionId: conversacionId,
      createdAt: {
        gte: new Date(Date.now() - VENTANA_MS),
      },
    },
  });
  return cantidadLimitados > 0;
}
