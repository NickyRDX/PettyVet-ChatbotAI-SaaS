"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import FlechaOut from "@/public/arrow-right-end.svg";
import MxPlayer from "@/public/mx-player.svg";
import Check from "@/public/check.svg";
import React from "react";
import Mockup from "../Mockup/Mockup";
import Paleta from "../Seccion-two/Paleta";

export default function HeroSection() {
  return (
    <main className="w-full pt-16 bg-slate-100 min-h-screen">
      <div className="flex flex-col w-full">
        {/* Section 1 Hero */}
        <section className="relative w-full pt-12 pb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col items-center text-center">
            {/* Regulatory & API Announcement Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm mb-6 max-w-xl transition-all cursor-default">
              <span className="size-2 rounded-full bg-secondary shrink-0 animate-pulse" />
              <span className="tracking-tight text-sm leading-tight font-light">
                Ahora compatible con la nueva normativa fiscal{" "}
                <strong className="font-medium tracking-tighter text-green-700">
                  ARCA
                </strong>{" "}
                y{" "}
                <strong className="font-medium tracking-tighter text-green-700 border-b-2 border-green-700">
                  WhatsApp Cloud API
                </strong>
              </span>
            </div>
            <h1 className="mb-6 tracking-tight leading-tight text-slate-800 max-w-4xl font-semibold text-6xl md:text-5xl">
              Tu Clinica Vaterinaria Automatizada con <br />
              <span className="text-[#0F766E] border-b-3 border-[#0F766E]">
                Inteligencia Artificial
              </span>{" "}
              y WhatsApp.
            </h1>
            {/* Subheadline */}
            <p className="max-w-2xl mb-10 leading-relaxed font-light text-slate-700 text-lg md:text-sm">
              Gestioná historias clínicas, turnos automatizados 24/7 por
              WhatsApp, stock en tiempo real y facturación electrónica ARCA
              legal en un solo sistema simple y veloz.
            </p>
            {/* Primary & Secondary Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-6">
              <Link href={`#`} className="w-full">
                <Button className="bg-[#0F766E] cursor-pointer text-white hover:bg-[#0F766E]/90 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-2 py-6 rounded-md text-sm tracking-tight font-normal">
                  Comenzar ahora
                  <Image
                    src={FlechaOut}
                    alt="arrow-right"
                    width={24}
                    height={24}
                  />
                </Button>
              </Link>
              <Link href="#" className="w-full">
                <Button
                  className="cursor-pointer w-full sm:w-auto inline-flex items-center justify-center gap-2 px-2 py-6 rounded-md font-normal tracking-tight text-sm"
                  variant="ghost"
                >
                  Ver demon interactivo
                  <Image
                    className="fill-green-400"
                    width={24}
                    height={24}
                    src={MxPlayer}
                    alt="mx-player"
                  />
                </Button>
              </Link>
            </div>
            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-sm text-slate-700 leading-relaxed tracking-tight">
              <span className="flex items-center gap-1.5">
                <Image src={Check} alt="check" width={21} height={21} />
                Sin Compromiso
              </span>
              <span className="flex items-center gap-1.5">
                <Image src={Check} alt="check" width={21} height={21} />
                Configuración en 20 minutos o menos
              </span>
              <span className="flex items-center gap-1.5">
                <Image src={Check} alt="check" width={21} height={21} />
                Servicios 24/7
              </span>
              <span className="flex items-center gap-1.5">
                <Image src={Check} alt="check" width={21} height={21} />
                Suscripción por Mercado Pago
              </span>
            </div>
          </div>
          <Mockup />
        </section>
        {/* Section 2 Paleta */}
        <Paleta/>
      </div>
    </main>
  );
}
