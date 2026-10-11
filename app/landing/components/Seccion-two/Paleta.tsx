"use client";
import React from "react";
import Image from "next/image";
import PaletaIcon from "@/public/palette.svg";
export default function Paleta() {
  return (
    <section className="w-full py-8 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="p-6 rounded-xl bg-secondary/40 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-sm text-sm tracking-tight font-medium text-muted-foreground bg-white shadow-xs mb-2">
                <Image
                  width={18}
                  height={18}
                  src={PaletaIcon}
                  alt="Paleta Icon"
                />
                Arquitectura Visual y Sistema Cromático
              </div>
              <h3 className="text-2xl font-medium leading-tight tracking-tight text-slate-700">
                Paleta de Colores Diseñadas para Clínicas Veterinarias.
              </h3>
              <p className="text-muted-foreground tracking-tight text-base leading-relaxed">
                Diseñadas para maximizar la legibilidad en pantallas clínicas
                con bajo agotamiento ocular.
              </p>
            </div>
            {/* Color Options Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Palette 1: Active */}
              <div className="p-3 rounded-lg bg-white shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800 text-lg">
                    1. Verde Clínico
                  </span>
                  <span className="px-1.5 py-0.5 rounded-sm bg-[#0F766E] text-white">
                    Activo
                  </span>
                </div>
                <div className="flex gap-1.5 mb-2">
                  <span className="size-6 rounded-sm bg-[#0F766E]" />
                  <span className="size-6 rounded-sm bg-[#10B981]" />
                  <span className="size-6 rounded-sm bg-secondary" />
                </div>
                <p className="text-[11px] font-normal tracking-wide leading-relaxed text-muted-foreground">
                  #0F766E • Autoridad médica, higiene y reducción del estrés
                  visual.
                </p>
              </div>
              {/* Palette 2: Inactivo */}
              <div className="p-3 rounded-lg bg-white shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800 text-lg">
                    2. Azul Quirúrgico
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium leading-tight tracking-tight">
                    Próximamente
                  </span>
                </div>
                <div className="flex gap-1.5 mb-2">
                  <span className="size-6 rounded-sm bg-blue-600" />
                  <span className="size-6 rounded-sm bg-blue-500" />
                  <span className="size-6 rounded-sm bg-secondary" />
                </div>
                <p className="text-[11px] font-normal tracking-wide leading-relaxed text-muted-foreground">
                  #2563EB • Rigor hospitalario, disciplina administrativa y
                  sobriedad.
                </p>
              </div>
              {/* Palette 3: Rojo Sangre */}
              <div className="p-3 rounded-lg bg-white shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800 text-lg">
                    3. Rojo Bio
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium leading-tight tracking-tight">
                    Próximamente
                  </span>
                </div>
                <div className="flex gap-1.5 mb-2">
                  <span className="size-6 rounded-sm bg-red-600" />
                  <span className="size-6 rounded-sm bg-red-400" />
                  <span className="size-6 rounded-sm bg-secondary" />
                </div>
                <p className="text-[11px] font-normal tracking-wide leading-relaxed text-muted-foreground">
                  #059669 • Conexión de bienestar animal, calidez y tono
                  biológico.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
