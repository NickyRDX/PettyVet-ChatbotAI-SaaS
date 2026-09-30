import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/generated/prisma/client";
const clienteSchema = z.object({
  clinicaId: z.string().trim().min(1, "La clinica es obligatoria"),
  telefono: z.string().trim().min(1, "El telefono es obligatorio"),
  nombre: z.string().trim().min(1).optional(),
});
type Cliente = z.infer<typeof clienteSchema>;
export async function POST(r: Request) {
  try {
    const b = await r.json();
    const resultado = clienteSchema.safeParse(b);
    if (!resultado.success) { 
      return Response.json({
        success: false,
        message: "Error al crear el cliente, datos invalidos",
        errors: resultado.error,
      }, {status: 400})
    }
    // datos correctamente validados 
    const datosCliente : Cliente = resultado.data
    const clientePrisma = await prisma.cliente.create({
      data: {
        clinicaId: datosCliente.clinicaId,
        telefono: datosCliente.telefono,
        nombre: datosCliente.nombre,
      },
    });
    return Response.json(
      {
        success: true,
        message: "Cliente creado correctamente",
        data : clientePrisma,
      },
      { status: 201 },
    );
  } catch (e : unknown) {
    console.error("Error al crear el cliente:", e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        return Response.json({
          success: false,
          message: "El telefono ya esta registrado",
          error: e.message,
        }, {status: 409})
      }
    }
    return Response.json({
      success: false,
      message: "Error al crear el cliente, datos invalidos",
      error: e instanceof Error ? e.message : "Error desconocido",
    }, {status: 400})
  }
}
