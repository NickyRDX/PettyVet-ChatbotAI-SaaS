import React from "react";
import Header from "./components/Header/Header";
import HeroSection from "./components/Seccion-one/Hero";
import Caracteristicas from "./components/caracteristicas/caracteristicas";
import Experiencia from "./components/Seccion-three/Experiencia";
import Argentina from "./components/Argentina/Argentina";
import Precio from "./components/Precio/Precio";


export default function LandingPage() {
  return (
    <div>
      <Header />
      <HeroSection/>
      <Caracteristicas/>
      <Experiencia/>
      <Argentina />
      <Precio/>
    </div>
  );
}
