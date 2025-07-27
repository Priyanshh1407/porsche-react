import React from 'react'
import { carThemes } from '../../data/carThemes'
import { carreraGT } from '../../data/modelsData/carreraGT'
import Navbar from '../../components/Navbar'
import Hero from '../../components/Hero';
import Highlights from '../../components/Highlights';
import Performance from '../../components/Performance';
import Features from '../../components/Features';
import Carousel from '../../components/Carousel';
import Footer from '../../components/Footer';
import LegacySection from '../../components/LegacySection';

export default function CarreraGT() {
  const selectedTheme = carThemes.carreraGT;
  const selectedData = carreraGT;
  return (
    <div className={`${selectedTheme.bgPattern}`}>
      <Navbar theme={selectedTheme} />
      <Hero data={selectedData.hero} theme={selectedTheme} />
      <LegacySection theme={selectedTheme} />
      <Highlights data={selectedData.highlights} theme={selectedTheme} />
      <Performance data={selectedData.performanceSpecs} theme={selectedTheme} image={selectedData.performanceImage} />
      <Features data={selectedData.detailedSpecs} theme={selectedTheme} />
      <Carousel data={selectedData.carouselSlides} theme={selectedTheme} heading={selectedData.carouselHeading} description={selectedData.carouselDescription} />
      <Footer fullName={selectedData.fullName} name={selectedData.name} theme={selectedTheme} />
    </div>
  )
}
