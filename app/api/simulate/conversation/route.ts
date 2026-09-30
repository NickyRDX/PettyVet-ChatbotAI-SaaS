import { prisma } from "@/lib/db/prisma";
// export async function GET(r: Request) {
//   const { searchParams } = new URL(r.url)
//   const clinicaId = searchParams.get("id")?.trim()
//   const clienteId = searchParams.get("id")?.trim()
//   if (!clinicaId || !clienteId) {
//     return Response.json(
//       {
//         ok: false,
//         message: "clinicaId y clienteId son obligatorios",
//       },
//       {
//         status: 400,
//       }
//     )
//   }
//   try {
//     const conversacion = await prisma.conversacion.findUnique({
//       where: {
//         clinicaId_clienteId: {
//           clienteId,
//           clinicaId,
//         },
//       },
//     });
//     if (!conversacion) {
//       return Response.json({
//         ok: false,
//         message: "Conversacion no encontrada",
//       }, {status: 400})
//     }
//     return Response.json({
//       ok: true,
//       data: conversacion,
//     },{status: 200})
//   } catch (e: unknown) {
//     console.error(e)
//     return Response.json(
//       {
//         ok: false,
//         message: "Error al obtener la conversacion",
//         error: e instanceof Error ? e.message : "Error desconocido",
//       }, {
//         status: 500
//       }
//     )
//   }
// }