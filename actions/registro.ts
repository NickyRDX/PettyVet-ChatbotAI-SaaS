// "use server" marca TODO lo que exporta este archivo como código que corre solo en el servidor.
// Así el formulario puede llamar a la función sin exponer nada al navegador.
"use server";

// Zod: valida que los datos tengan la forma correcta antes de usarlos.
import { z } from "zod";
// Cliente de Supabase pensado para el servidor (lee y escribe la sesión en cookies).
import { createClient } from "@/lib/supabase/server";
// cookies() da acceso a las cookies del pedido actual (ahí viaja la sesión).
import { cookies } from "next/headers";

// Reglas que tiene que cumplir lo que escribe el usuario.
// Se validan acá, en el servidor, porque el navegador se puede manipular (trust boundary).
const registroSchema = z.object({
  email: z.email("El email no es válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

// Forma del resultado que esta función le devuelve a la página.
// No se exporta: un archivo "use server" solo debe exportar funciones asíncronas.
type ActionState = {
  errors?: string; // mensaje para mostrar; no existe si todo salió bien
  ok: boolean; // true = usuario creado
};

// useActionState le pasa como primer parámetro el resultado anterior (estadoPrevio);
// acá no se usa, pero hay que declararlo para que el segundo parámetro sea formData.
// formData trae lo que el usuario escribió en el formulario.
// Promise<ActionState>: la función es async y siempre devuelve este tipo; TypeScript avisa si falta un caso.
export async function register(
  estadoPrevio: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // safeParse no lanza excepciones: devuelve { success, data | error }.
  // Los valores se leen por el atributo name="" de cada input del formulario.
  const validatedFields = registroSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // Return temprano: si los datos no sirven, se corta acá y no se llama a Supabase.
  if (!validatedFields.success) {
    return {
      // Se muestra solo el primer problema: alcanza para el cartel de la página.
      errors: validatedFields.error.issues[0].message,
      ok: false,
    };
  }

  // Un cliente nuevo por pedido, armado con las cookies de ESE pedido.
  const supabase = createClient(await cookies());

  // Se usan los datos ya validados (validatedFields.data), nunca el formData crudo.
  // signUp crea el usuario y le manda el email de confirmación.
  // Supabase guarda solo un hash de la contraseña: nunca queda en tu base.
  const { error } = await supabase.auth.signUp({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
  });

  if (error) {
    // Se loguea solo el código del error: nunca el email ni la contraseña (F2: sin datos personales).
    console.error("Falló el registro en Supabase, código:", error.code);
    return {
      // Mensaje genérico a propósito: si dijera "ese email ya existe",
      // un atacante podría averiguar quién tiene cuenta (user enumeration).
      errors: "No se pudo completar el registro",
      ok: false,
    };
  }

  // Éxito: la página avisa que revise su email para confirmar la cuenta.
  return { ok: true };
}
