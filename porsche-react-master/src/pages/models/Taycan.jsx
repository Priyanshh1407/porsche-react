import React, { useEffect } from 'react'
import { carThemes } from '../../data/carThemes';
import { taycan } from '../../data/modelsData/taycan'
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import Highlights from '../../components/Highlights';
import Performance from '../../components/Performance';
import Features from '../../components/Features';
import Carousel from '../../components/Carousel';
import Footer from '../../components/Footer';
import EVSpecs from "../../components/EVSpecs";

export default function Taycan() {
  const selectedTheme = carThemes.taycan;
  const selectedData = taycan;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`${selectedTheme.bgPattern}`}>
      <Navbar theme={selectedTheme} />
      <Hero data={selectedData.hero} theme={selectedTheme} />
      <EVSpecs theme={selectedTheme} />
      <Features data={selectedData.detailedSpecs} theme={selectedTheme} />
      <Performance data={selectedData.performanceSpecs} theme={selectedTheme} image={selectedData.performanceImage} />
      <Highlights data={selectedData.highlights} theme={selectedTheme} />
      <Carousel data={selectedData.carouselSlides} theme={selectedTheme} heading={selectedData.carouselHeading} description={selectedData.carouselDescription} />
      <Footer fullName={selectedData.fullName} name={selectedData.name} theme={selectedTheme} />
    </div>
  )
}
