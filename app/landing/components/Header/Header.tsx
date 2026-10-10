import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";
interface HeaderProps {
  id: number;
  label: string;
  href: string;
}
const navItems: HeaderProps[] = [
  { id: 1, label: "Características", href: "#Características" },
  { id: 2, label: "WhatsApp IA", href: "#WhatsAppIA" },
  { id: 3, label: "Facturación", href: "#Facturación" },
  { id: 4, label: "Prontuario & Citas", href: "#Prontuario&Citas" },
  { id: 5, label: "Precio", href: "#Precio" },
  { id: 6, label: "Multi-sede", href: "#Multi-sede" },
  { id: 7, label: "Contacto", href: "#Contacto" },
];
export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F766E] backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.08)]">
      <div className="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link
            data-path="landing-principal"
            className="flex items-center gap-3"
            href={`#`}
          >
            <span className="font-semibold text-xl md:text-md text-center text-white tracking-tight">
              PETTYVET
            </span>
          </Link>
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-200/40">
            <span className="font-light text-sm text-slate-200">
              🌎 hecho para argentina
            </span>
          </div>
        </div>
        <nav
          data-active-classes="text-primary font-medium"
          className="hidden lg:flex items-center gap-4 xl:gap-8"
        >
          {navItems.map(({ id, label, href }) => (
            <Link
              className="font-light text-sm text-slate-200 hover:text-slate-700 transition-colors duration-300"
              key={id}
              href={href}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="#">
            <Button className="flex items-center gap-1.5 leading-tight cursor-pointer text-md px-3 py-5 tracking-tight bg-[#10B981] border-none">
              Prueba
              <Image src="/flecha.svg" alt="flecha" width={20} height={20} />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
