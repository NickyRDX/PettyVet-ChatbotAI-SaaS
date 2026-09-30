import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const MensajeSchema = z.object({
  clinicaId: z.string().trim().min(1),
  conversacionId: z.string().trim().min(1),
  wamid: z.string().trim().min(1),
  direccion: z.enum(["ENTRANTE", "SALIENTE"]),
  tipo: z.enum(["TEXTO", "AUDIO"]),
  cuerpo: z.string().trim().min(1),
});
type MensajeSchemaType = z.infer<typeof MensajeSchema>;
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validarBody = MensajeSchema.safeParse(body);
    if (!validarBody.success) {
      return Response.json(
        {
          success: false,
          message: "Datos inválidos",
          errors: validarBody.error.flatten().fieldErrors,
        },
        {
          status: 400,
        },
      );
    }
    const datosValidados: MensajeSchemaType = validarBody.data;
    const conversacion = await prisma.conversacion.findUnique({
      where: {
        id: datosValidados.conversacionId,
      },
    });
    if (!conversacion) {
      return Response.json(
        {
          success: false,
          message: "Conversación no encontrada",
        },
        { status: 404 },
      );
    }
    if (conversacion.clinicaId !== datosValidados.clinicaId) {
      return Response.json(
        {
          success: false,
          message: "La conversación no pertenece a esta clínica",
        },
        { status: 403 },
      );
    }
    const NuevoMensaje = await prisma.mensaje.create({
      data: {
        clinicaId: datosValidados.clinicaId,
        conversacionId: datosValidados.conversacionId,
        wamid: datosValidados.wamid,
        direccion: datosValidados.direccion,
        tipo: datosValidados.tipo,
        cuerpo: datosValidados.cuerpo,
      },
      include: {
        clinica: true,
        conversacion: true,
      },
    });
    return Response.json(
      {
        success: true,
        message: "Mensaje creado correctamente",
        data: NuevoMensaje,
      },
      { status: 201 },
    );
  } catch (e: unknown) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return Response.json(
        {
          success: false,
          message: "Este mensaje de WhatsApp ya lo procesé",
        },
        {
          status: 409,
        },
      );
    }
    return Response.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      {
        status: 500,
      },
    );
  }
}
