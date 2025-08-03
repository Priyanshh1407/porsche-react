import React, { useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { carThemes } from '../../data/carThemes'
import { turbos_911 } from '../../data/modelsData/turbos_911';
import Hero from '../../components/Hero';
import Highlights from '../../components/Highlights';
import Features from '../../components/Features';
import Performance from '../../components/Performance';
import Carousel from '../../components/Carousel';
import Footer from '../../components/Footer';
import DailyDriverInfo from "../../components/DailyDriverInfo";

export default function TurboS_911() {
  const selectedTheme = carThemes.turboS;
  const selectedData = turbos_911;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`${selectedTheme.bgPattern}`}>
      <Navbar theme={selectedTheme} />
      <Hero data={selectedData.hero} theme={selectedTheme} />
      <DailyDriverInfo theme={selectedTheme} />
      <Highlights data={selectedData.highlights} theme={selectedTheme} />
      <Features data={selectedData.detailedSpecs} theme={selectedTheme} />
      <Performance data={selectedData.performanceSpecs} theme={selectedTheme} image={selectedData.performanceImage} />
      <Carousel data={selectedData.carouselSlides} theme={selectedTheme} heading={selectedData.carouselHeading} description={selectedData.carouselDescription} />
      <Footer fullName={selectedData.fullName} name={selectedData.name} theme={selectedTheme} />
    </div>
  )
}
