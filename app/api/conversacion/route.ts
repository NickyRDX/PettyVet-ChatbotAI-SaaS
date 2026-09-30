import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
// const schema = z.object({
//   clinicaId: z.string().trim().min(1),
//   clienteId: z.string().trim().min(1),
// });
// type SchemaConversacion = z.infer<typeof schema>;
// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const verificacion = schema.safeParse(body);
//     if (!verificacion.success) {
//       return Response.json(
//         {
//           error: "Datos invalidos",
//           details: verificacion.error.flatten().fieldErrors,
//         },
//         { status: 400 },
//       );
//     }
//     const datos: SchemaConversacion = verificacion.data;
//     // Buscar la clinica
//     const clinicas = await prisma.clinica.findUnique({
//       where: {
//         id: datos.clinicaId,
//       },
//     });
//     /* Verificar si la clinica existe */
//     if (!clinicas) {
//       return Response.json(
//         {
//           success: false,
//           message: "Clinica no encontrada",
//         },
//         { status: 404 },
//       );
//     }
//     /* Buscar el cliente */
//     const clientes = await prisma.cliente.findUnique({
//       where: {
//         id: datos.clienteId,
//       },
//     });
//     /* Verificar si el cliente existe */
//     if (!clientes) {
//       return Response.json(
//         {
//           success: false,
//           message: "Cliente no encontrado",
//         },
//         { status: 404 },
//       );
//     }
//     /* Verificar que el cliente pertenece a la clinica */
//     if (clientes.clinicaId !== datos.clinicaId) {
//       return Response.json(
//         {
//           success: false,
//           error: "El cliente no pertenece a esta clinica",
//         },
//         { status: 403 },
//       );
//     }
//     const conversacion = await prisma.conversacion.findUnique({
//       where: {
//         clinicaId_clienteId: {
//           clinicaId: datos.clinicaId,
//           clienteId: datos.clienteId,
//         }
//       }
//     })
//     if (conversacion) {
//       return Response.json({
//         success: false,
//         message: "La conversacion ya existe",
//       }, { status : 409})
//     } else {
//       const nuevaConversacion = await prisma.conversacion.create({
//         data: {
//           clinicaId: datos.clinicaId,
//           clienteId: datos.clienteId,
//         }
//       });
//       return Response.json({
//         success: true,
//         ok: true,
//         data: nuevaConversacion,
//         message: "Conversacion creada exitosamente",
//       }, { status: 201 })
//     }
//     /* Por ahora solamente devolvemos los datos encontrados */
//     return Response.json(
//       {
//         success: true,
//         message: "Consulta / verificación exitosa",
//         data: {
//           clinica: clinicas,
//           cliente: clientes
//         },
//       },
//       { status: 200 },
//     );
//   } catch (e: unknown) {
//     console.error("Error dectectado en la consulta", e);
//     return Response.json(
//       {
//         success: false,
//         message: "Error dectectado en la consulta",
//         details: e instanceof Error ? e.message : "Error desconocido",
//       },
//       { status: 500 },
//     );
//   }
// }
// ---------------------------------------------------------
// 1. ESQUEMA DE VALIDACIÓN
// ---------------------------------------------------------

const schema = z.object({
  clinicaId: z.string().trim().min(1),
  clienteId: z.string().trim().min(1),
});

// ---------------------------------------------------------
// 2. TIPO DERIVADO DEL ESQUEMA
// ---------------------------------------------------------

type SchemaConversacion = z.infer<typeof schema>;

// ---------------------------------------------------------
// 3. ENDPOINT POST
// ---------------------------------------------------------

export async function POST(req: Request) {
  try {
    // -----------------------------------------------------
    // 4. LEER EL BODY
    // -----------------------------------------------------

    const body = await req.json();

    // -----------------------------------------------------
    // 5. VALIDAR LOS DATOS RECIBIDOS
    // -----------------------------------------------------

    const verificacion = schema.safeParse(body);

    // Si los datos no cumplen nuestro esquema,
    // detenemos la ejecución y devolvemos HTTP 400.
    if (!verificacion.success) {
      return Response.json(
        {
          success: false,
          message: "Datos inválidos",
          details: verificacion.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // -----------------------------------------------------
    // 6. OBTENER LOS DATOS YA VALIDADOS
    // -----------------------------------------------------

    const datos: SchemaConversacion = verificacion.data;

    // -----------------------------------------------------
    // 7. BUSCAR LA CLÍNICA
    // -----------------------------------------------------

    const clinica = await prisma.clinica.findUnique({
      where: {
        id: datos.clinicaId,
      },
    });

    // Si Prisma no encuentra la clínica, devuelve null.
    // En ese caso devolvemos 404.
    if (!clinica) {
      return Response.json(
        {
          success: false,
          message: "Clínica no encontrada",
        },
        { status: 404 }
      );
    }

    // -----------------------------------------------------
    // 8. BUSCAR EL CLIENTE
    // -----------------------------------------------------

    const cliente = await prisma.cliente.findUnique({
      where: {
        id: datos.clienteId,
      },
    });

    // Si Prisma no encuentra el cliente, devuelve null.
    if (!cliente) {
      return Response.json(
        {
          success: false,
          message: "Cliente no encontrado",
        },
        { status: 404 }
      );
    }

    // -----------------------------------------------------
    // 9. VERIFICAR LA RELACIÓN CLIENTE → CLÍNICA
    // -----------------------------------------------------

    if (cliente.clinicaId !== datos.clinicaId) {
      return Response.json(
        {
          success: false,
          message: "El cliente no pertenece a esta clínica",
        },
        { status: 403 }
      );
    }

    // -----------------------------------------------------
    // 10. BUSCAR SI YA EXISTE UNA CONVERSACIÓN
    // -----------------------------------------------------

    const conversacion = await prisma.conversacion.findUnique({
      where: {
        clinicaId_clienteId: {
          clinicaId: datos.clinicaId,
          clienteId: datos.clienteId,
        },
      },
    });

    // -----------------------------------------------------
    // 11. EVITAR CONVERSACIONES DUPLICADAS
    // -----------------------------------------------------

    if (conversacion) {
      return Response.json(
        {
          success: false,
          message: "La conversación ya existe",
          data: conversacion,
        },
        { status: 409 }
      );
    }

    // -----------------------------------------------------
    // 12. CREAR LA NUEVA CONVERSACIÓN
    // -----------------------------------------------------

    const nuevaConversacion = await prisma.conversacion.create({
      data: {
        clinicaId: datos.clinicaId,
        clienteId: datos.clienteId,
      },
    });

    // -----------------------------------------------------
    // 13. DEVOLVER LA CONVERSACIÓN CREADA
    // -----------------------------------------------------

    return Response.json(
      {
        success: true,
        message: "Conversación creada exitosamente",
        data: nuevaConversacion,
      },
      { status: 201 }
    );
  } catch (e: unknown) {
    // -----------------------------------------------------
    // 14. MANEJO DE ERRORES DE PRISMA
    // -----------------------------------------------------

    console.error("Error al crear la conversación:", e);

    // P2002 = violación de una restricción UNIQUE.
    //
    // Esto puede ocurrir si dos solicitudes intentan crear
    // al mismo tiempo la misma combinación:
    //
    // clinicaId + clienteId
    //
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return Response.json(
        {
          success: false,
          message: "La conversación ya existe",
        },
        { status: 409 }
      );
    }

    // -----------------------------------------------------
    // 15. ERROR GENERAL DEL SERVIDOR
    // -----------------------------------------------------

    return Response.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}