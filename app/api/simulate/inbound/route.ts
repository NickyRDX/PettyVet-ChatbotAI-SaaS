// importamos la dependencia de zod
import { z } from "zod";
// definimos el schema de validacion
const schemaValidacion = z.object({
  clinicId: z.string(),
  phone: z.string(),
  message: z.string(),
});
// definimos los types de la validacion
// obtenemos el tipo automáticamente
type SchemaMessage = z.infer<typeof schemaValidacion>;
// Definimos la funcion de la API con el metodo POST | Endpoint
export async function POST(req: Request) {
  /* manejar errores en tiempo de ejecución y evitar que la aplicación se detenga de forma inesperada */
  try {
    // leer y validar el body
    const body = await req.json();
    // safeParse devuelve un resultado con success o error
    const r = schemaValidacion.safeParse(body);
    console.log("esto me muestra r en la consola", r);
    // Aquí manejamos los errores con un condicional
    if (!r.success) {
      return Response.json(
        {
          success: false,
          error: "Datos invalidos",
          message: "Error al validar jodete PAPI!!!",
          details: r.error,
        },
        { status: 400 },
      );
    }
    // Datos validados correctamente y tipados
    const datosOk: SchemaMessage = r.data;
    console.log("esto me muestra datosOk");
    // Aquí iran la logica (guardar en DB)
    return Response.json(
      {
        success: true,
        message: "Datos validados correctamente",
        data: datosOk,
      },
      { status: 200 },
    );
  } catch (e) {
    console.error(`Error en POST /api/simulate/inbound: ${e}`);
    return Response.json(
      {
        ok: false,
        error: "Error interno del servidor",
      },
      { status: 500 },
    );
  }
}
