import { prisma } from "@/lib/db/prisma";
import { exigirApiKey } from "@/lib/seguridad/exigirApiKey";
export async function GET(r: Request, { params }: { params: Promise<{ id: string}> }) {
  const rechazarEntrada = exigirApiKey(r);
  if(rechazarEntrada) return rechazarEntrada;
  try {
    const { id } = await params;
    // console.log("nombre del params: ", nombre)
    console.log("ID del params: ", id)
    const clinica = await prisma.clinica.findUnique({
      where: {
        id: id,
        // nombre: nombre ?? undefined
      },
    });
    if (!clinica) {
      return Response.json(
        {
          ok: false,
          message: "Clinica no encontrada",
          error: "Clinica no encontrada",
        },
        { status: 400 },
      );
    }
    return Response.json(
      {
        ok: true,
        data: clinica,
      },
      { status: 200 },
    );
  } catch (e) {
    console.error(e);
    return Response.json(
      {
        ok: false,
        message: "Error al obtener la clinica",
        error: e,
      },
      { status: 500 },
    );
  }
}
