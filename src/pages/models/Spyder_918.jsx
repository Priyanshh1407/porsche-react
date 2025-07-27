import React from 'react'
import { spyder_918 } from '../../data/modelsData/spyder_918';
import { carThemes } from '../../data/carThemes';
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import Performance from '../../components/Performance';
import Features from '../../components/Features';
import Highlights from '../../components/Highlights';
import Carousel from '../../components/Carousel';
import Footer from '../../components/Footer';
import HybridTech from "../../components/HybridTech";

export default function Spyder_918() {
  const selectedData = spyder_918;
  const selectedTheme = carThemes.spyder918;

  return (
    <div className={`${selectedTheme.bgPattern}`}>
      <Navbar theme={selectedTheme} />
      <Hero data={selectedData.hero} theme={selectedTheme} />
      <HybridTech theme={selectedTheme} />
      <Performance data={selectedData.performanceSpecs} theme={selectedTheme} image={selectedData.performanceImage} />
      <Features data={selectedData.detailedSpecs} theme={selectedTheme}/>
      <Highlights data={selectedData.highlights} theme={selectedTheme} />
      <Carousel data={selectedData.carouselSlides} theme={selectedTheme} heading={selectedData.carouselHeading} description={selectedData.carouselDescription} />
      <Footer fullName={selectedData.fullName} name={selectedData.name} theme={selectedTheme} />
    </div>
  )
}
