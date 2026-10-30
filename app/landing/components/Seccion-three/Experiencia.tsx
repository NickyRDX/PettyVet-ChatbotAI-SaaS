"use client";
import React, { useState } from "react";
import {
  MessageSquare,
  Receipt,
  PawPrint,
  Check,
  FileText,
  Download,
} from "lucide-react";

/* Misma escala en los tres paneles: etiqueta, título, párrafo y tarjeta. */
const etiqueta =
  "inline-block rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em]";
const tituloPanel =
  "mt-4 text-[1.5rem] font-medium leading-[1.2] tracking-[-0.025em] text-balance text-slate-800 sm:mt-5 sm:text-[1.75rem] lg:text-[2.125rem]";
const cuerpo =
  "mt-4 max-w-[38rem] text-[15px] leading-[1.7] text-slate-500 sm:mt-5 sm:leading-[1.75]";
const grilla = "grid items-start gap-y-8 lg:grid-cols-2 lg:items-center lg:gap-x-16";
const tarjeta =
  "rounded-2xl bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/80 sm:p-6";

/*
  Cada objeto es una pestaña completa:
  - id: el número que vamos a recordar cuando alguien haga click
  - numero y titulo: lo que se lee en el botón de arriba
  - Panel: el dibujo de abajo. Es una función que devuelve JSX.
*/
const experiencias = [
  {
    id: 1,
    numero: "1. ",
    titulo: "WhatsApp AI en Acción",
    icono: MessageSquare,
    Panel: PanelWhatsapp,
  },
  {
    id: 2,
    numero: "2. ",
    titulo: "Facturación ARCA en unos minutos",
    icono: Receipt,
    Panel: PanelFacturacion,
  },
  {
    id: 3,
    numero: "3. ",
    titulo: "Ficha Médica Integral",
    icono: PawPrint,
    Panel: PanelFicha,
  },
];

export default function Experiencia() {
  /*
    activa guarda el id de la pestaña abierta.
    Empieza en 1, así que al cargar se ve WhatsApp.
    setActiva es la única forma de cambiar ese número.
  */
  const [activa, setActiva] = useState(1);

  /*
    Buscamos en la lista el objeto cuyo id coincide con activa.
    Si activa es 2, experienciaVisible es Facturación.
    El "?" evita un error si por algún motivo no hubiera coincidencia.
  */
  const experienciaVisible = experiencias.find((item) => item.id === activa);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <div className="mx-auto mb-10 max-w-2xl text-center lg:mb-14">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0F766E]">
            Demostración en Vivo
          </span>
          <h2 className="mt-3 text-2xl font-medium leading-tight tracking-tight text-slate-800 sm:text-3xl lg:text-4xl">
            Experiencia fluida para el equipo clínico
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-[1.7] text-slate-500">
            Descubrí cómo Pettyvet simplifica las 3 tareas que más tiempo
            consumen en una veterinaria moderna.
          </p>
        </div>

        <div className="mb-6 flex flex-col items-stretch gap-2 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-2.5">
          {experiencias.map(({ id, numero, titulo, icono: Icono }) => {
            /* esteBotonEstaElegido es true solo en el botón que coincide con activa */
            const esteBotonEstaElegido = activa === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiva(id)}
                className={
                  esteBotonEstaElegido
                    ? "inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-[#0E6B63] px-4 text-[13px] font-medium tracking-[-0.01em] text-white transition-colors hover:bg-[#0c5c55] sm:h-10 sm:w-auto"
                    : "inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-[#F3F1F8] px-4 text-[13px] font-medium tracking-[-0.01em] text-slate-600 transition-colors hover:bg-[#E9E6F1] sm:h-10 sm:w-auto"
                }
              >
                <Icono className="size-3.5" />
                <span>
                  {numero}
                  {titulo}
                </span>
              </button>
            );
          })}
        </div>

        {/*
          El recuadro no elige nada por su cuenta.
          Pinta el Panel del objeto que encontramos arriba.
        */}
        <div className="rounded-[24px] bg-[#F6F5FB] px-4 py-6 sm:px-8 sm:py-8 lg:min-h-[520px] lg:rounded-[28px] lg:px-12 lg:py-14">
          {experienciaVisible ? <experienciaVisible.Panel /> : null}
        </div>
      </div>
    </section>
  );
}

function PanelWhatsapp() {
  return (
    <div className={grilla}>
      <div>
        <span className={`${etiqueta} bg-[#D9F5E8] text-[#047857]`}>
          Disponibilidad 24/7 sin guardia presencial
        </span>
        <h3 className={tituloPanel}>
          Agendamiento por conversación natural sin formularios externos
        </h3>
        <p className={cuerpo}>
          Los tutores no quieren descargar aplicaciones nuevas ni llenar
          formularios engorrosos. Escriben a tu WhatsApp de siempre, la
          inteligencia artificial entiende el motivo de consulta, verifica si es
          urgencia y reserva el turno médico.
        </p>
        <ul className="mt-8 space-y-3.5 text-[14px] leading-snug text-slate-600">
          <li className="flex gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-[#0E6B63]" />
            Triage inteligente: detecta palabras clave de emergencia médica.
          </li>
          <li className="flex gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-[#0E6B63]" />
            Envío de recordatorio previo con botón de confirmación/cancelación.
          </li>
          <li className="flex gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-[#0E6B63]" />
            Respuestas personalizadas con el nombre y especie de cada mascota.
          </li>
        </ul>
      </div>

      <div className={tarjeta}>
        <div className="mb-5 flex flex-col gap-1 text-[11px] tracking-wide text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>Canal Oficial Verificado</span>
          <span>Latencia de IA: 900ms</span>
        </div>
        <div className="space-y-3 text-[13px] leading-[1.65]">
          <div className="rounded-xl bg-[#F4F6F8] px-4 py-3.5 text-slate-600">
            <span className="font-medium text-slate-800">Tutor (Tomás): </span>
            “Buenas tardes, Coco está tosiendo mucho desde anoche. ¿Hay algún
            turno hoy?”
          </div>
          <div className="rounded-xl bg-[#0E6B63] px-4 py-3.5 text-white">
            <span className="font-medium">VetPulse IA: </span>
            “Hola Tomás. Lamentamos que Coco no se sienta bien. Por la
            sintomatología respiratoria, te sugerimos una consulta prioritaria
            hoy con la Dra. Paula a las 17:30 hs o a las 19:00 hs. ¿Cuál te
            queda mejor?”
          </div>
          <div className="rounded-xl bg-[#F4F6F8] px-4 py-3.5 text-slate-600">
            <span className="font-medium text-slate-800">Tutor: </span>
            “A las 17:30 por favor.”
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl bg-[#0E6B63] px-4 py-3.5 text-white">
            <div>
              <p className="font-medium">Turno Confirmado: 17:30 hs</p>
              <p className="text-[11px] text-white/75">
                Paciente: Coco (Bulldog Francés) • Dra. Paula (Clínica)
              </p>
            </div>
            <Check className="size-4 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PanelFacturacion() {
  return (
    <div className={grilla}>
      <div>
        <span className={`${etiqueta} bg-white font-medium text-slate-500 ring-1 ring-slate-200`}>
          RG 4291 / Homologación Oficial
        </span>
        <h3 className={tituloPanel}>
          Facturá en un clic sin entrar a la página de ARCA
        </h3>
        <p className={cuerpo}>
          Olvidate de ingresar con Clave Fiscal cada vez que finaliza una
          atención. Conectá el certificado digital de tu veterinaria una sola
          vez y emití comprobantes fiscales al instante con cobro por Mercado
          Pago o efectivo.
        </p>
        <div className="mt-8 max-w-xl rounded-2xl bg-white px-5 py-4 text-sm leading-[1.65] text-slate-500 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-[#0E6B63]">
            COMPATIBILIDAD TOTAL
          </p>
          <p className="mt-2">
            Monotributistas y Responsables Inscriptos. Facturación de servicios
            médicos veterinarios y productos de pet shop en comprobantes
            unificados o separados.
          </p>
        </div>
      </div>

      <div className={tarjeta}>
        <div className="mb-2 flex items-start justify-between gap-4">
          <div>
            <p className="text-[15px] font-medium tracking-[-0.01em] text-slate-800">
              Emisión Rápida de Comprobante
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Receptor: Consumidor Final (DNI: 34.881.029)
            </p>
          </div>
          <span className="shrink-0 rounded-md bg-[#D9F5E8] px-2 py-1 text-[11px] font-semibold text-[#047857]">
            CAE Automático
          </span>
        </div>
        <div className="mt-2 divide-y divide-slate-100 text-sm leading-5 text-slate-600">
          <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <span>Consulta Clínica Canina + Fármaco Inyectable</span>
            <span className="shrink-0 tabular-nums font-medium text-slate-800">
              $22.000,00 ARS
            </span>
          </div>
          <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <span>Alimento Royal Canin Renal 3kg</span>
            <span className="shrink-0 tabular-nums font-medium text-slate-800">
              $38.400,00 ARS
            </span>
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-4 rounded-xl bg-[#EEF2FF] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] text-slate-400">
              TOTAL FACTURADO
            </p>
            <p className="mt-1 text-[1.35rem] font-semibold leading-none tabular-nums tracking-[-0.02em] text-[#0E6B63]">
              $60.400,00 ARS
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0E6B63] px-3.5 text-sm font-medium text-white transition-colors hover:bg-[#0c5c55]"
          >
            <Receipt className="size-4" />
            Emitir Factura
          </button>
        </div>
      </div>
    </div>
  );
}

function PanelFicha() {
  return (
    <div className={grilla}>
      <div>
        <span className={`${etiqueta} bg-[#0E6B63] text-white`}>
          Especializado para Medicina Veterinaria
        </span>
        <h3 className={tituloPanel}>
          Historial clínico exhaustivo con adjuntos diagnósticos
        </h3>
        <p className={cuerpo}>
          Diseñado pensando en la velocidad de la consulta diaria. Anotaciones
          por voz, curvas evolutivas de peso y edad, carga de análisis de
          laboratorio y recetas digitales con membrete profesional.
        </p>
        <div className="mt-6 grid max-w-xl grid-cols-2 gap-2.5 sm:mt-8 sm:gap-3">
          <div className="rounded-2xl bg-white px-3.5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:px-5 sm:py-5">
            <p className="text-[1.35rem] font-semibold leading-none tracking-[-0.03em] text-[#0E6B63] sm:text-[1.65rem]">
              100%
            </p>
            <p className="mt-2 text-[12px] leading-snug text-slate-400 sm:mt-2.5 sm:text-[13px]">
              Trazabilidad de cirugías y anestesias
            </p>
          </div>
          <div className="rounded-2xl bg-white px-3.5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:px-5 sm:py-5">
            <p className="text-[1.35rem] font-semibold leading-none tracking-[-0.03em] text-[#0E6B63] sm:text-[1.65rem]">
              0 Papeles
            </p>
            <p className="mt-2 text-[12px] leading-snug text-slate-400 sm:mt-2.5 sm:text-[13px]">
              Consentimientos firmados en tablet
            </p>
          </div>
        </div>
      </div>

      <div className={tarjeta}>
        <div className="mb-5 flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-full bg-[#FFE8D6] text-[#C2410C]">
            <PawPrint className="size-5" />
          </div>
          <div>
            <p className="text-[15px] font-medium tracking-[-0.01em] text-slate-800">
              Simba <span className="font-normal text-slate-300">•</span> Felino
              Doméstico
            </p>
            <p className="mt-0.5 text-xs leading-5 text-slate-400">
              Tutor: Sofía Bianchi • San Isidro
            </p>
            <p className="text-xs leading-5 text-slate-400">
              Microchip: 985109281
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-[#F7F8FA] px-4 py-4 text-sm leading-[1.65] text-slate-600">
          <div className="mb-2 flex flex-col gap-1 text-[11px] tracking-wide text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <span>Última Consulta Médica: Control Renal</span>
            <span className="shrink-0">Hace 3 días</span>
          </div>
          Ecografía abdominal adjunta. Parámetros de urea y creatinina estables.
          Se indica dieta seca medicada y control en 60 días.
        </div>
        <div className="mt-3 flex items-center justify-between gap-4 rounded-xl bg-[#F7F8FA] px-4 py-3.5 text-sm">
          <div className="flex min-w-0 items-center gap-2.5">
            <FileText className="size-4 shrink-0 text-[#0E6B63]" />
            <div className="min-w-0">
              <p className="truncate text-slate-700">
                Analisis_Sangre_Completo_Simba.pdf
              </p>
              <p className="text-xs text-slate-400">
                Laboratorio Veterinario Norte • 2.4 MB
              </p>
            </div>
          </div>
          <Download className="size-4 shrink-0 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
