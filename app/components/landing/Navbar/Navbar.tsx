"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav
        aria-label="Navegación Principal"
        className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="PettyVet - Inico"
          className="text-lg font-bold tracking-tight text-slate-800 transition-colors hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500"
        >
          PettyVet
        </Link>
        {/* Navegación */}
        <div className="flex items-center">
          <Link href="/pricing">
            <Button className="rounded-full border border-slate-200/70 bg-white/5 px-4 py-2 text-sm font-medium text-slate-800 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 cursor-pointer">
              Precio
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
