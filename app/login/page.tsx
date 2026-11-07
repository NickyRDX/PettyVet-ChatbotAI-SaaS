// Sin "use client": esta página solo arma el diseño; el formulario (con el hook) ya es cliente.
// El diseño es el mismo que el de /registro para que las dos pantallas se vean de la misma familia.
import Link from "next/link";
import LoginForm from "./components/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-secondary text-primary p-4">
              LG
            </div>
            PETTYVET
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block"></div>
    </div>
  );
}
