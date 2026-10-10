"use client";
import Bot from "@/public/bot.svg";
import Image from "next/image";
import Calendario from "@/public/calendario.svg";
import CheckValor from "@/public/checkValor.svg";
import Flecha from "@/public/arrow-google-green.svg";
import Facturacion from "@/public/facturacion.svg";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function Mockup() {
  return (
    <div className="w-full max-w-[1600px] mx-auto mt-16 rounded-2xl bg-white shadow-xl p-4 sm:p-6 lg:p-8 text-left">
      <div className="flex items-center justify-between pb-6 mb-6">
        <div className="flex items-center gap-3">
          <span className="size-4 rounded-full bg-green-500" />
          <span className="size-4 rounded-full bg-yellow-500" />
          <span className="size-4 rounded-full bg-red-500" />
          <span className="text-sm text-slate-700 ml-1.5 font-sans leading-tight tracking-tighter">
            vetpulse.app/panel/clinica-palermo
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-white/80 hidden md:flex items-center gap-1.5 font-light text-sm">
            <span className="size-2 rounded-full bg-emerald-300" />
            Sincronización ARCA: Activa
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mockup left WhatsApp: AI bot interaction */}
        <div className="lg:col-span-4 rounded-xl p-4 bg-secondary flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="size-10 rounded-lg bg-emerald-700 flex items-center justify-center">
                <Image src={Bot} alt="Bot" width={32} height={32} />
              </div>
              <div>
                <h4 className="text-slate-800 font-medium leading-tight tracking-tight">
                  PettyVetPlus AI Bot
                </h4>
                <p className="font-light text-sm text-slate-600 leading-relaxed tracking-tight">
                  WhatsApp Cloud API
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-emerald-200 text-emerald-600 tracking-tight text-sm font-semibold">
              Turno en Vivos
            </span>
          </div>
          {/* Chat messages stream */}
          <div className="flex flex-col gap-6 my-2">
            <div className="self-start max-w-[85%] bg-white rounded-lg rounded-tl-sm p-3 shadow-sm">
              <p className="text-base md:text-sm text-slate-800 leading-relaxed tracking-tight">
                Hola Dr. Reyes! Soy Violetta, la dueña de Milo (Golden de 3
                años). Tienen turno para vacunación mañana?
              </p>
              <span className="block text-right mt-1 text-[12px] font-light text-slate-600">
                14:25
              </span>
            </div>
            <div className="self-end max-w-[85%] bg-emerald-600 rounded-lg rounded-tr-sm p-3 shadow-sm">
              <p className="text-base md:text-sm text-slate-100 leading-relaxed tracking-tight">
                Hola Violetta! Si, tenemos turno para vacunación mañana.
                ¿Podrías venir a las 10:00hs?
              </p>
              <span className="block text-right mt-1 text-[12px] font-light text-slate-200">
                14:30 • IA
              </span>
            </div>
            <div className="self-start max-w-[85%] bg-white rounded-lg rounded-tl-sm p-3 shadow-sm">
              <p className="text-base md:text-sm text-slate-800 leading-relaxed tracking-tight">
                Perfecto! Mil Gracias! Ya que tengo dispobible a la mañana,
                porque a la tarde tengo compromisos.
              </p>
              <span className="block text-right mt-1 text-[12px] font-light text-slate-600">
                14:37
              </span>
            </div>
            <div className="self-end max-w-[85%] bg-emerald-600 rounded-lg rounded-tr-sm p-3 shadow-sm">
              <p className="text-base md:text-sm text-slate-100 leading-relaxed tracking-tight">
                Perfecto! voy a agendar tu cita con en nuestra base de datos.
                Por favor llegue a las 10:30hs
              </p>
              <span className="block text-right mt-1 text-[12px] font-light text-slate-200">
                14:37 • IA
              </span>
            </div>
            <div className="self-end max-w-[85%] flex items-center gap-2  text-slate-800  bg-slate-200/50 rounded-lg p-2.5 shadow-sm">
              <Image
                className="mr-1"
                src={Calendario}
                alt="Check"
                width={40}
                height={40}
              />
              <p className="text-sm font-semibold leading-tight tracking-tight">
                ¡Confirmado! Agendado en el sistema y sincronizado con nuestra
                base de datos.
              </p>
            </div>
          </div>
          <div className="pt-2 text-center">
            <span className="text-[12px] text-slate-600 text-outline font-normal">
              Tasa de respuesta del bot: 1.6 segundos
            </span>
          </div>
        </div>
        {/* Mockup Center WhatsApp: AI bot interaction */}
        <div className="lg:col-span-5 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-lg bg-secondary flex items-center justify-center text-primary font-bold text-2xl">
                  🐶
                </div>
                <div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-medium text-slate-700 text-xl">Milo</h3>
                    <span className="bg-secondary max-w-fit rounded-lg p-1 m-0.5 text-sm">
                      HC #8492
                    </span>
                    <p>Golden Retriever • Macho • 3a 2m • 32.8 kg</p>
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-200">
                Al día
              </span>
            </div>
            {/* Quick Medical Metrics */}
            <div className="grid grid-cols-3 gap-2 my-3 py-2 bg-secondary/50 text-center rounded-md">
              <div>
                <span className="font-medium text-[10px] text-slate-800 uppercase block">
                  Último Peso
                </span>
                <span className="text-slate-900 font-semibold text-[15px]">
                  {" "}
                  32.8 kg
                </span>
              </div>
              <div>
                <span className="font-medium text-[10px] text-slate-800 uppercase block">
                  Microchip
                </span>
                <span className="text-slate-900 font-semibold text-[15px]">
                  98109823
                </span>
              </div>
              <div>
                <span className="font-medium text-[10px] text-slate-800 uppercase block">
                  Dueño
                </span>
                <span className="text-slate-900 font-semibold text-[15px]">
                  Violetta Sánchez
                </span>
              </div>
            </div>
            {/* Clinical Plan Timeline */}
            <div className="space-y-2 mt-4">
              <p className="tracking-wider font-semibold text-slate-800 uppercase text-sm text-start">
                Plan de Vacunación & profilaxis
              </p>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2">
                  <Image src={CheckValor} alt="Chack" />
                  <span className="font-medium text-slate-800 text-[15px] tracking-tight leading-tight">
                    Séxtuple Canino Anual
                  </span>
                </div>
                <span className="text-slate-600 font-normal text-[16px] leading-tight">
                  Aplica mañana
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2">
                  <Image src={CheckValor} alt="Chack" />
                  <span className="font-medium text-slate-800 text-[15px] tracking-tight leading-tight">
                    Antirrábica
                  </span>
                </div>
                <span className="text-slate-600 font-normal text-[16px] leading-tight">
                  Vence 18/Nov
                </span>
              </div>
            </div>
          </div>
          <div className="pt-4 flex items-center justify-between">
            <span className="text-slate-700 leading-tight tracking-wide">
              Dueño vinculado: +54 9 381 344-XXXX
            </span>
            <Link
              href="/"
              className="flex gap-1.5 items-center justify-center text-slate-700 font-medium text-[15px] leading-tight tracking-wide"
            >
              Ficha Médica
              <Image src={Flecha} alt="Flecha" width={20} height={20} />
            </Link>
          </div>
        </div>
        {/* Mockup Right */}
        <div className="lg:col-span-3 rounded-xl bg-secondary/50 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <span className="font-normal text-[15px] flex items-center gap-1.5 leading-tight tracking-tight text-slate-700">
                <Image
                  src={Facturacion}
                  alt="Facturacion"
                  width={30}
                  height={30}
                />
                Comprobante Oficial
              </span>
              <span className="bg-slate-500/20 px-2 py-0.5 rounded-md text-[12px] tracking-wide font-bold leading-relaxed text-center">
                FACTURA B
              </span>
            </div>
            {/* ARCA Metadata Snippet */}
            <div className="bg-white p-3 shadow-md rounded-xs space-y-4 mb-3">
              <div className="flex justify-between items-center text-sm leading-tight tracking-tight">
                <span className="text-slate-600">Punto de Venta:</span>
                <span className="text-black">0004 - Palermo</span>
              </div>
              <div className="flex justify-between items-center text-sm leading-tight tracking-tight">
                <span className="text-slate-600">Comp. Nro:</span>
                <span className="text-black">00018923</span>
              </div>
              <div className="flex justify-between items-center text-sm leading-tight tracking-tight">
                <span className="text-slate-600">CAE Homologado:</span>
                <span className="text-black">74839201948271</span>
              </div>
              <div className="flex justify-between items-center text-sm leading-tight tracking-tight">
                <span className="text-slate-600">Vto. CAE:</span>
                <span className="text-black">24/10/2025</span>
              </div>
            </div>
            {/* Breakdown item */}
            <div className="space-y-1.5 text-[14px] font-medium">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Consulta Médica General:{" "}
                </span>
                <span className="text-muted-foreground">$18.500 ARS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Vacuna Séxtuple Vanguard:{" "}
                </span>
                <span className="text-muted-foreground">$14.200 ARS</span>
              </div>
              <div className="flex justify-between pt-2 font-semibold text-2xl md:text-lg">
                <span className="uppercase text-slate-800">
                  Total con iva:{" "}
                </span>
                <span className="text-[#166534]">$32.700 ARS</span>
              </div>
            </div>
          </div>
          <div className='p-4'>
            <Button className='w-full py-4 px-3 shadow-sm tracking-tight leading-tight text-slate-700 font-normal text-[15px] rounded-sm cursor-pointer' variant="outline">
              Enivar PDF a WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
