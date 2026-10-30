import React from "react";
import Header from "./components/Header/Header";
import HeroSection from "./components/Seccion-one/Hero";
import Caracteristicas from "./components/caracteristicas/caracteristicas";
import Experiencia from "./components/Seccion-three/Experiencia";
export default function LandingPage() {
  return (
    <div>
      <Header />
      <HeroSection/>
      <Caracteristicas/>
      <Experiencia/>
    </div>
  );
}
