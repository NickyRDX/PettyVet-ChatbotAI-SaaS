import React from "react";
import Image from "next/image";
import Pesos from "@/public/Pesos.svg";
import Arca from "@/public/Arca.svg";
import Datos from "@/public/data.svg";
import Asistente from "@/public/asistente.svg";
const features = [
  {
    images: Pesos,
    id: 1,
    title: "Precios fijos en AR$",
    description:
      "Sin sorpresas con el tipo de cambio ni impuestos PAIS. Factura local A o B deducible de tus impuestos.",
  },
  {
    images: Arca,
    id: 2,
    title: "Conexión Oficial ARCA",
    description:
      "Integración continua con los servidores de recaudación fiscal. Si la normativa cambia, tu sistema se actualiza solo.",
  },
  {
    images: Datos,
    id: 3,
    title: "Servidores SUPABASE",
    description:
      "Velocidad de respuesta ultrarrápida (menos de 35ms) y cumplimiento de la Ley de Protección de Datos Personales.",
  },
  {
    images: Asistente,
    id: 4,
    title: "Soporte por WhastApp",
    description:
      "Hablás con nuestro Asistente Virtual, implementado en IA para resolver tus dudas rápidamente.",
  },
];
export default function Argentina() {
  return (
    <section className="w-full py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="rounded-xl bg-secondary/40 p-8 lg:p-14 shadow-sm">
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center-safe gap-2 px-3 py-1 bg-white/80 rounded-sm mb-4 font-light leading-tight text-slate-700 tracking-tight text-[13px]">
              <span className="text-lg">🇦🇷</span>
              <span className="">Pensado & Operando 100% en Argentina</span>
            </div>
            <h2 className="tracking-tight text-slate-800 text-2xl mb-3 leading-tight lg:text-3xl font-medium">
              Construido para resolver las complejidades de nuestras
              veterinarias
            </h2>
            <p className="text-muted-foreground leading-tight tracking-wide text-[15px]">
              Los software importados cobran en dólares con impuestos abusivos y
              no comprenden la burocracia Local Argentina. PettyVet nació para
              resolver las complejidades de las veterinarias locales.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ images, id, title, description }) => (
              <div className="bg-white rounded-xl p-6 shadow-sm" key={id}>
                <Image
                  src={images}
                  className="mb-4"
                  alt="iconos de las caracteristicas"
                  width={26}
                  height={26}
                />
                <h3 className="mb-2 text-slate-800 text-2xl md:text-lg font-medium tracking-tight leading-tight">
                  {title}
                </h3>
                <p className="text-muted-foreground leading-relaxed tracking-wide text-[13px]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
