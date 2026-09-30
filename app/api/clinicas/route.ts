import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
export async function GET(r: Request) {
  try {
    const { searchParams } = new URL(r.url);
    const nombreClinica = searchParams.get("nombre")?.trim();
    const clinicaId = searchParams.get("id")?.trim();
    // Objeto de filtros para Prisma: solo incluye condiciones si el cliente las pidió en la URL.
    const where = {
      // Spread (...): si hay texto en ?nombre=, mezcla este filtro en `where`; si no, mezcla {} (no filtra por nombre).
      ...(nombreClinica
        ? {
            // `contains`: el nombre en BD debe contener el texto (no tiene que ser igual exacto).
            nombre: {
              contains: nombreClinica,
              // `insensitive`: mayúsculas/minúsculas no importan ("vet" encuentra "Veterinaria").
              mode: "insensitive" as const,
            },
          }
        : {}),
      // Igual que arriba: solo filtra por id si vino ?id= en la query string.
      ...(clinicaId
        ? {
            // Coincidencia exacta con el id de la clínica (string/cuid según tu schema).
            id: clinicaId,
          }
        : {}),
    };
    // Consulta todas las filas de la tabla `clinica` que cumplan `where`, ordenadas A→Z por nombre.
    const clinicas = await prisma.clinica.findMany({
      where, // filtros opcionales construidos arriba
      orderBy: {
        nombre: "asc", // ascendente: de la A a la Z
      },
    });
    return Response.json(
      {
        ok: true,
        data: clinicas,
      },
      {
        status: 200,
      }
    )
  } catch (e: unknown) {
    console.error("Error al obtener las clinicas", e);
    return Response.json(
      {
        ok: false,
        message: "Error al obtener las clinicas",
      },
      {
        status: 500,
      },
    );
  }
}
const clinicSchema = z.object({
  nombre: z.string().trim().min(1, { message: "El nombre es requerido" }),
  zonaHoraria: z
    .string()
    .min(1, { message: "La zona horaria es requerida" })
    .default("America/Argentina/Buenos_Aires"),
  duracionTurnoMinutos: z.number().int().positive().default(20),
  telefonoWhatsapp: z.string().optional(),
  metaPhoneNumberId: z.string().optional(),
});
// type ClinicType = z.infer<typeof clinicSchema>;

export async function POST(req: Request) {
  try {
    const b: unknown = await req.json();
    const r = clinicSchema.safeParse(b);
    if (!r.success) {
      return Response.json(
        {
          ok: false,
          message: "Datos inválidos",
          details: r.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }
    const clinic = await prisma.clinica.create({
      data: r.data,
    });
    return Response.json(
      {
        ok: true,
        message: "Clínica creada correctamente",
        clinic,
      },
      {
        status: 201,
      },
    );
  } catch (e: unknown) {
    console.error("Error al crear la clínica:", e);
    const prismaError = e as {
      code?: string;
      meta?: {
        target?: string[];
      };
    };
    if (prismaError.code === "P2002") {
      return Response.json(
        {
          success: false,
          message: "El nombre de la clínica ya existe",
          fields: prismaError.meta?.target ?? [],
        },
        { status: 409 },
      );
    }
    return Response.json(
      {
        success: false,
        message: "Error al crear la clínica",
        error: "Más detalles en la consola por el error " + e,
      },
      {
        status: 500,
      },
    );
  }
}

