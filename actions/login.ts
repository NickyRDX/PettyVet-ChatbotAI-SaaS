// "use server": todo lo que exporta este archivo corre solo en el servidor.
"use server";

// Zod valida la forma de los datos antes de usarlos.
import { z } from "zod";
// cookies() da acceso a las cookies del pedido (ahí viaja la sesión).
import { cookies } from "next/headers";
// redirect() lleva al usuario a otra página desde el servidor.
import { redirect } from "next/navigation";
// Cliente de Supabase del servidor: lee y escribe la sesión en cookies.
import { createClient } from "@/lib/supabase/server";

// En el login solo se exige que haya algo escrito; la regla de los 8 caracteres es de cuando se crea la cuenta.
// Validar acá (servidor) es obligatorio: el navegador se puede manipular.
const loginSchema = z.object({
  email: z.email("El email no es válido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
});

// Resultado que vuelve a la página. No se exporta: un archivo "use server" solo exporta funciones async.
type ActionState = {
  errors?: string; // mensaje a mostrar; no existe si todo salió bien
  ok: boolean;
};

// useActionState pasa primero el resultado anterior (no se usa) y después los datos del formulario.
export async function login(
  estadoPrevio: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // safeParse no lanza excepciones: devuelve { success, data | error }.
  const campos = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // Return temprano: con datos inválidos no se molesta a Supabase.
  if (!campos.success) {
    return { errors: campos.error.issues[0].message, ok: false };
  }

  const supabase = createClient(await cookies());

  // Si las credenciales son correctas, Supabase crea la sesión y setAll la guarda en una cookie.
  const { error } = await supabase.auth.signInWithPassword({
    email: campos.data.email,
    password: campos.data.password,
  });

  if (error) {
    // Solo el código del error en el log: nunca el email ni la contraseña (F2).
    console.error("Falló el inicio de sesión, código:", error.code);
    return {
      // Mismo mensaje si el email no existe o la contraseña está mal:
      // distinguirlos le diría a un atacante qué emails tienen cuenta (user enumeration).
      errors: "Email o contraseña incorrectos",
      ok: false,
    };
  }

  // shortcut: lleva a la landing porque todavía no existe el panel; apuntarlo al panel cuando exista.
  // redirect() funciona lanzando una excepción interna, por eso va fuera de cualquier try/catch.
  redirect("/");
}
