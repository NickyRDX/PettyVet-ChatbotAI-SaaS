// Este archivo usa un hook (useActionState), por eso tiene que ser un Client Component.
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Hook de React 19 que conecta el formulario con la Server Action.
import { useActionState } from "react";
// La función del servidor que valida y crea el usuario (actions/registro.ts).
import { register } from "@/actions/registro";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

export default function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  // estado: lo que devolvió register la última vez ({ ok } o { errors, ok }).
  // action: la función que va en <form action>; ya trae el estado anterior incorporado.
  // pendiente: true mientras el servidor está procesando el envío.
  // El orden es fijo: los arreglos se desestructuran por posición, no por nombre.
  const [estado, action, pendiente] = useActionState(register, { ok: false });

  return (
    // Al enviar, React llama a action con los datos del formulario (FormData).
    <form
      action={action}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-medium text-slate-800">Crea tu Cuenta</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Rellena el siguiente formulario para crear tu cuenta
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          {/* name="email" es lo que lee formData.get("email") en el servidor. */}
          {/* autoComplete deja que el navegador sugiera y guarde el dato. */}
          <Input
            className="py-5 rounded-sm"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            required
          />
          <FieldDescription>
            Utilizaremos esto para ponernos en contacto contigo. No
            compartiremos tu correo electrónico con nadie más.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          {/* new-password: le avisa al navegador que es una cuenta nueva. */}
          <Input
            className="py-5 rounded-sm"
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Contraseña"
            required
          />
          <FieldDescription>Debe tener al menos 8 caracteres.</FieldDescription>
          {/* Si estado.errors está vacío, FieldError no dibuja nada. */}
          <FieldError>{estado.errors}</FieldError>
        </Field>

        <Field>
          {/* Solo aparece cuando register devolvió { ok: true }. */}
          {estado.ok && (
            <p className="text-sm text-primary">
              Revisá tu email para confirmar tu cuenta.
            </p>
          )}
          {/* disabled evita enviar dos veces mientras el servidor trabaja. */}
          <Button
            className="p-5 rounded-sm cursor-pointer text-white text-sm tracking-wide font-medium bg-[#0F766E] hover:bg-[#14b8a6]"
            type="submit"
            disabled={pendiente}
          >
            {pendiente ? <Spinner className="w-4 h-4" /> : "Crear Cuenta"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
