import { Button } from "@/components/ui/button";
import Check from "@/public/check.svg";
import Image from "next/image";
import React from "react";
import Flecha from "@/public/flecha.svg";
import { cn } from "@/lib/utils";
interface PlanInterface {
  id: number;
  title: string;
  span: string;
  price: string;
  money: string;
  feature: string[];
  icon: typeof Check;
  activar?: boolean 
}
const PLANES: PlanInterface[] = [
  {
    id: 1,
    title: "Consultorio",
    span: "Ideal par veterinarios independientes o clínicas pequeñas.",
    price: "39.999",
    money: "ARS",
    feature: [
      "1 Veterinario titular",
      "1 Sede / Consultorio único",
      "Limitación de API Inteligente Artificial",
      "Mensajes Limitados para Clientes",
      "Razonamiento IA Bajo",
      "Suscripción por Mercado Pago"
    ],
    icon: Check,
    activar: false,
  },
  {
    id: 2,
    title: "Clínica",
    span: "Para clínicas veterinarias en crecimiento",
    price: "79.999",
    money: "ARS",
    feature: [
      "1 Veterinario titular",
      "1 Sede / Consultorio único",
      "Más Llamadas a API Inteligente Artificial",
      "Más Mensajes para Clientes",
      "Acceso al Panel de Control",
      "Razonamiento IA Medio",
      "Datos Seguros y Protegidos",
      "Suscripción por Mercado Pago",
    ],
    icon: Check,
    activar: true,
  },
  {
    id: 3,
    title: "Sedes",
    span: "Multiples Clínicas en un solo lugar de gestión",
    price: "119.999",
    money: "ARS",
    feature: [
      "Multiple Veterinarios Titulares",
      "Múltiples Sedes / Consultorios",
      "2x Más Llamadas a API Inteligente Artificial",
      "2x Más Mensajes para Clientes",
      "Acceso al Panel de Control",
      "Razonamiento IA Alto",
      "Datos Seguros y Protegidos",
      "Suscripción por Mercado Pago",
    ],
    icon: Check,
    activar: false,
  },
];
export default function Precio() {
  return (
    <section id="Precio" className="w-full py-20 bg-secondary/50">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="uppercase font-semibold text-[#0f766e] tracking-wide text-sm">
            Tarifas Transparentes
          </span>
          <h2 className="mt-2 mb-4 tracking-tight text-2xl text-slate-800 leading-tight ">
            Planes claros en pesos argentinos, sin costos ocultos
          </h2>
          <p className="text-muted-foreground text-[15px] leading-relaxed tracking-wide">
            Comenzá con 7 días de prueba gratuita. Sin compromiso a largo plazo.
          </p>
          <div className="inline-flex items-center gap-3 p-1.5 shadows-sm mt-6 rounded-md bg-secondary/40">
            <Button
              variant="outline"
              className="border-0 text-slate-700 transition-all shadow-sm px-4 py-2 tracking-tight cursor-pointer rounded-sm "
            >
              Facturación Mensual
            </Button>
          </div>
        </div>
        {/* Suscripcion precios */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Planes */}
          {PLANES.map(({ id, title, span, price, money, feature, icon, activar }) => (
            <div
              key={id}
              className="p-8 rounded-sm bg-white shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-slate-800 font-medium leading-relaxed tracking-tight text-3xl">
                      {title}
                    </h3>
                    <p className="text-muted-foreground text-[13px] leading-relaxed tracking-tight">
                      {span}
                    </p>
                  </div>
                </div>
                <div className="my-6">
                  <span className="text-slate-800 font-semibold tracking-wide leading-tight text-4xl">
                    ${price}
                  </span>
                  <span className="block text-muted-foreground text-[14px] leading-relaxed tracking-wide">
                    {money} / Mes
                  </span>
                </div>
                <ul className="space-y-2.5 text-muted-foreground text-[15px] mb-8">
                  {feature.map((item, index) => (
                    <li className="flex items-center-safe gap-2 leading-tight tracking-tight" key={index}>
                      <Image src={icon} alt={item} width={20} height={20} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Button variant={activar ? null : "secondary"} className={cn ("rounded-sm font-medium cursor-pointer py-5 tracking-wide text-slate-700", activar && "bg-[#0f766e] text-white hover:bg-[#14b8a6]")}>
                  Prueba Gratis 7 días {activar && <Image src={Flecha} alt="flecha" width={20} height={20} />}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
