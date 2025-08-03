import React, { useEffect } from 'react'
import { carThemes } from '../../data/carThemes';
import { cayenne } from '../../data/modelsData/cayenne'
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import Highlights from '../../components/Highlights';
import Performance from '../../components/Performance';
import Features from '../../components/Features';
import Carousel from '../../components/Carousel';
import Footer from '../../components/Footer';
import CayenneOffroad from "../../components/CayenneOffroad";

export default function Cayenne() {
  const selectedTheme = carThemes.cayenne;
  const selectedData = cayenne;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`${selectedTheme.bgPattern}`}>
      <Navbar theme={selectedTheme} />
      <Hero data={selectedData.hero} theme={selectedTheme} />
      <CayenneOffroad theme={selectedTheme} />
      <Performance data={selectedData.performanceSpecs} theme={selectedTheme} image={selectedData.performanceImage} />
      <Highlights data={selectedData.highlights} theme={selectedTheme} />
      <Features data={selectedData.detailedSpecs} theme={selectedTheme} />
      <Carousel data={selectedData.carouselSlides} theme={selectedTheme} heading={selectedData.carouselHeading} description={selectedData.carouselDescription} />
      <Footer fullName={selectedData.fullName} name={selectedData.name} theme={selectedTheme} />
    </div>
  )
}
