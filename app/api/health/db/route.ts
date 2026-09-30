import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json(
      {
        ok: true,
        database: "connected",
        message: "Conexión a la base de datos exitosa, sos un Crack",
      },
      
    );
  } catch (error) {
    console.error("Error al verificar la conexión a la base de datos:", error);
    return Response.json(
      {
        ok: false,
        error: "Database connection failed",
      },
      {
        status: 500,
      },
    );
  }
}
