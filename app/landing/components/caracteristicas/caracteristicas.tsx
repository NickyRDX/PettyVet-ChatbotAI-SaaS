"use client";
import React from "react";
import Image from "next/image";
import Message from "@/public/mensajes.svg";
import Calendar from "@/public/calendario-ok.svg";
import Billing from "@/public/facturacion-dos.svg";
import Check from "@/public/check.svg";
import Ficha from "@/public/ficha.svg";
import Escudo from "@/public/escudo.svg";
import Stock from "@/public/caja.svg";
import Historial from "@/public/multipleMensaje.svg";
import Supervisor from "@/public/supervisor.svg";
import Sedes from "@/public/sedes.svg";
import Peligro from "@/public/peligro.svg";
export default function caracteristicas() {
  return (
    <section className="w-full py-20 bg-secondary/50" id="caracteristicas">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="uppercase text-[#0F766E] font-semibold leading-tight tracking-wide text-sm">
            Módulos Especializados
          </span>
          <h2 className="mt-2 mb-4 tracking-tight text-slate-700 text-5xl lg:text-4xl leading-tight font-medium">
            Todo lo que tu equipo necesita en un solo software
          </h2>
          <p className="leading-relaxed text-muted-foreground tracking-wide text-[15px]">
            Sin pestañas abiertas por separado ni planillas de cálculo
            obsoletas. Todo integrado de punta a punta
          </p>
        </div>
        {/* Bento Grid 7 Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bento 1: Chatbot Whatsapp IA */}
          <div className="lg:col-span-2 p-8 rounded-md bg-white shadow-md flex flex-col justify-between">
            <div>
              <div className="size-12 rounded-lg bg-secondary/60 flex items-center justify-center mb-6">
                <Image src={Message} alt="Message" width={24} height={24} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-slate-800 font-normal tracking-tight text-3xl leading-tight">
                  Chatbot Asistente con IA en WhatsApp
                </h3>
                <span className="px-2 py-1 rounded-md bg-[#3de7af] text-[#0F766E] text-sm font-semibold leading-tight tracking-tight">
                  Cloud API Oficial
                </span>
              </div>
              <p className="max-w-xl text-muted-foreground tracking-tight font-normal leading-relaxed">
                Atención 24/7 a dueños de mascotas. El asistente responde
                preguntas frecuentes, propone horarios según la agenda médica
                real, confirma reservas y carga la consulta en la ficha del
                paciente automáticamente.
              </p>
            </div>
            <div className="mt-8 pt-6 bg-secondary/50 rounded-lg gap-4 p-4 flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-[#10B981] animate-ping" />
                <span className="font-medium text-slate-800 text-xs md:text-sm tracking-tight leading-tight">
                  Reducción del 70% de llamadas telefónicas a recepción.
                </span>
              </div>
              <span className="font-semibold text-muted-foreground text-xs md:text-sm leading-tight tracking-tighter">
                Sin costo extra por mensajes
              </span>
            </div>
          </div>
          {/* Bento 2: Agenda y Citas Inteligentes */}
          <div className="p-8 rounded-md bg-white shadow-md flex flex-col justify-between">
            <div>
              <div className="size-12 rounded-lg bg-secondary/60 flex items-center justify-center mb-6">
                <Image src={Calendar} alt="Calendar" width={24} height={24} />
              </div>
              <h3 className="text-slate-800 font-normal tracking-tight text-3xl leading-tight">
                Agenda y Citas Inteligentes
              </h3>
              <p className="max-w-xl text-muted-foreground tracking-tight font-normal leading-relaxed">
                Calendarios individuales por profesional veterinario.
                Recordatorios automatizados 24h y 2h antes por WhatsApp,
                reduciendo el ausentismo no avisado en un 65%.
              </p>
            </div>
          </div>
          {/* Bento 3: Facturación Electrónica */}
          <div className="p-8 rounded-md bg-white shadow-md flex flex-col justify-between">
            <div>
              <div className="size-12 rounded-lg bg-secondary/60 flex items-center justify-center mb-6">
                <Image src={Billing} alt="Invoice" width={24} height={24} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-slate-800 font-normal tracking-tight text-3xl leading-tight">
                  Facturación ARCA
                </h3>
              </div>
              <p className="max-w-xl text-muted-foreground tracking-tight font-normal leading-relaxed">
                Emisión directa de Facturas A, B, C y Notas de Crédito con CAE
                instantáneo. Homologado según la RG vigente. Generación de
                ticket PDF con código QR y envío directo al cliente por
                WhatsApp.
              </p>
            </div>
            <div className="mt-8 pt-6 bg-secondary/50 rounded-lg gap-4 p-4 flex items-center justify-between">
              <span className="font-medium text-slate-800 text-xs md:text-sm tracking-tight leading-tight">
                CAE Valido en 800ms
              </span>
              <Image src={Check} alt="Check" width={24} height={24} />
            </div>
          </div>
          {/* Bento 4: Prontuario y Ficha Médica de Mascotas */}
          <div className="p-8 rounded-md bg-white shadow-md flex flex-col justify-between">
            <div>
              <div className="size-12 rounded-lg bg-secondary/60 flex items-center justify-center mb-6">
                <Image src={Ficha} alt="Medical" width={24} height={24} />
              </div>
              <h3 className="text-slate-800 font-normal tracking-tight text-3xl leading-tight">
                Ficha Médica y Prontuario
              </h3>
              <p className="max-w-xl text-muted-foreground tracking-tight font-normal leading-relaxed">
                Historial clínico centralizado: planes de vacunación,
                desparasitaciones, cirugías, recetas digitales, adjuntos de
                ecografías o radiografías, Todo en una sola Web App
              </p>
            </div>
            <div className="mt-8 pt-6 bg-secondary/50 rounded-lg gap-4 p-4 flex items-center justify-between text-sm lg:text-base">
              <Image src={Escudo} alt="Escudo" width={24} height={24} />
              Almacenamiento Médico inalterable y seguro
            </div>
          </div>
          {/* Bento 5: Gestor de Stock y Farmacia Veterinaria */}
          <div className="p-8 rounded-md bg-white shadow-md flex flex-col justify-between">
            <div>
              <div className="size-12 rounded-lg bg-secondary/60 flex items-center justify-center mb-6">
                <Image src={Stock} alt="Stock" width={24} height={24} />
              </div>
              <h3 className="text-slate-800 font-normal tracking-tight text-3xl leading-tight">
                Control de Stock y Farmacia
              </h3>
              <p className="max-w-xl text-muted-foreground tracking-tight font-normal leading-relaxed">
                Control de medicamentos, trazabilidad de lotes y fechas de
                vencimiento. Descuento automático de dosis tras cada
                procedimiento quirúrgico o aplicación de vacuna.
              </p>
            </div>
            <div className="mt-8 pt-6 bg-secondary/50 rounded-lg gap-4 p-4 flex items-center justify-between text-sm lg:text-base">
              <Image src={Peligro} alt="Peligro" width={24} height={24} />
              Alerta de reposición minima automática
            </div>
          </div>
          {/* Bento 6: Historial Unificado de conversaciones*/}
          <div className="p-8 rounded-md bg-white shadow-md flex flex-col justify-between">
            <div>
              <div className="size-12 rounded-lg bg-secondary/60 flex items-center justify-center mb-6">
                <Image src={Historial} alt="Historial" width={24} height={24} />
              </div>
              <h3 className="text-slate-800 font-normal tracking-tight text-3xl leading-tight">
                Bandeja Multi-Agente Unificada
              </h3>
              <p className="max-w-xl text-muted-foreground tracking-tight font-normal leading-relaxed">
                Visualizá en tiempo real todo lo que conversa el bot de IA.
                Cualquier veterinario o recepcionista puede intervenir la charla
                con un solo clic sin perder contexto.
              </p>
            </div>
            <div className="mt-8 pt-6 bg-secondary/50 rounded-lg gap-4 p-4 flex items-center justify-between text-sm lg:text-base">
              <Image src={Supervisor} alt="Supervisor" width={24} height={24} />
              Múltiples secretarias con un solo número
            </div>
          </div>
          {/* Bento 7: Multi-sede y Gestión de Empleados (Full span Card) */}
          <div className="lg:col-span-2 p-8 rounded-2xl bg-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="size-12 rounded-xl bg-secondary/60 flex items-center justify-center text-primary mb-4">
                <Image src={Sedes} alt="Sedes" width={24} height={24} />
              </div>
              <h3 className="text-slate-800 font-normal tracking-tight text-3xl leading-tight">
                Multi-sede y Permisos Clínicos Granulares
              </h3>
              <p className="max-w-xl text-muted-foreground tracking-tight font-normal leading-relaxed">
                Gestioná sucursales independientes o cadenas hospitalarias con
                stock cruzado. Asigná roles protegidos: Veterinario de Guardia,
                Cirujano, Asistente, Facturista o Peluquería Canina.
              </p>
            </div>
            <div className="shrink-0">
              <div className="p-4 rounded-lg bg-secondary/30 text-center">
                <span className="text-[#0F766E] font-semibold tracking-tight text-2xl md:text-3xl leading-tight block">
                  +60 Sedes
                </span>
                <span className='text-muted-foreground tracking-tight font-normal leading-relaxed text-[14px]'>Conectadas en Tiempo Real</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
