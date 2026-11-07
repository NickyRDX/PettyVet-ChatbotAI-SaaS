// Usa un hook (useActionState), por eso tiene que ser un Client Component.
"use client";

import Link from "next/link";
import { useActionState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// La función del servidor que verifica el email y la contraseña (actions/login.ts).
import { login } from "@/actions/login";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

export default function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  // El orden es fijo: [lo que devolvió login, la función para el <form>, ¿está enviando?].
  const [estado, action, pendiente] = useActionState(login, { ok: false });

  return (
    // Al enviar, React llama a action con los datos del formulario (FormData).
    <form
      action={action}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-medium text-slate-800">Iniciá sesión</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Ingresá con tu email y tu contraseña
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          {/* name="email" es lo que lee formData.get("email") en el servidor. */}
          <Input
            className="py-5 rounded-sm"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          {/* current-password: el navegador ofrece la contraseña guardada. */}
          <Input
            className="py-5 rounded-sm"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Contraseña"
            required
          />
          {/* Si estado.errors está vacío, FieldError no dibuja nada. */}
          <FieldError>{estado.errors}</FieldError>
        </Field>

        <Field>
          {/* disabled evita enviar dos veces mientras el servidor trabaja. */}
          <Button
            className="p-5 rounded-sm cursor-pointer text-white text-sm tracking-wide font-medium bg-[#0F766E] hover:bg-[#14b8a6]"
            type="submit"
            disabled={pendiente}
          >
            {pendiente ? <Spinner className="w-4 h-4" /> : "Entrar"}
          </Button>
          <FieldDescription className="text-center">
            ¿No tenés cuenta?{" "}
            <Link href="/registro" className="underline underline-offset-4">
              Registrate
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
