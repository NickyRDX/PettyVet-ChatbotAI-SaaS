// Adaptador oficial de Prisma para PostgreSQL usando el driver `pg`.
// En Prisma 7 la conexión en runtime no va en schema.prisma: se configura acá con un "driver adapter".
// PrismaPg traduce las operaciones del ORM al protocolo que entiende el paquete `pg`.
import { PrismaPg } from "@prisma/adapter-pg"

// Cliente TypeScript generado por `prisma generate` a partir de prisma/schema.prisma.
// Vive en generated/prisma/ (ver generator.output en el schema).
// Expone métodos tipados por modelo: prisma.clinica, prisma.cliente, prisma.cita, etc.
import { PrismaClient } from "../../generated/prisma/client"

// Contenedor en el objeto global de Node para reutilizar la misma instancia de Prisma.
// En desarrollo, Next.js recarga módulos con hot reload; sin esto cada recarga abriría
// otra conexión a la DB y podrías agotar el pool de conexiones.
// El cast añade la propiedad `prisma` al tipo de globalThis de forma segura en TypeScript.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

// Crea una instancia nueva de PrismaClient solo cuando aún no existe una en global.
function createPrismaClient() {
  // URL de Postgres (ej: postgresql://user:pass@host:5432/db).
  // Se lee de .env / .env.local. Si falta, fallamos al arrancar en vez de en el primer query.
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("Falta DATABASE_URL en el entorno")
  }

  // Conecta Prisma con PostgreSQL a través del adaptador y el driver `pg`.
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

// Punto único de acceso a la base de datos para el resto de la app.
// Si ya hay instancia en global (dev + hot reload), la reutiliza; si no, crea una nueva.
// Otros archivos importan: `import { prisma } from "@/lib/db/prisma"`
// y pueden leer/escribir Clinica, Cliente, Conversacion, Mensaje, Cita, etc.
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Solo en desarrollo: guardamos la instancia en global para sobrevivir al hot reload.
// En producción el proceso es estable y no hace falta este truco.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
