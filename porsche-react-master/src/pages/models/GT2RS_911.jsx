import React, { useEffect } from 'react'
import { carThemes } from '../../data/carThemes'
import { gt2rs_911 } from '../../data/modelsData/gt2rs_911';
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import Performance from '../../components/Performance';
import Features from '../../components/Features';
import Highlights from '../../components/Highlights';
import Carousel from '../../components/Carousel';
import Footer from '../../components/Footer';
import WarningBanner from "../../components/WarningBanner";

export default function GT2RS_911() {
  const selectedTheme = carThemes.gt2rs;
  const selectedData = gt2rs_911;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`${selectedTheme.bgPattern}`}>
      <Navbar theme={selectedTheme} />
      <Hero data={selectedData.hero} theme={selectedTheme} />
      <WarningBanner theme={selectedTheme} />
      <Performance data={selectedData.performanceSpecs} theme={selectedTheme} image={selectedData.performanceImage} />
      <Features data={selectedData.detailedSpecs} theme={selectedTheme} />
      <Highlights data={selectedData.highlights} theme={selectedTheme} />
      <Carousel data={selectedData.carouselSlides} theme={selectedTheme} heading={selectedData.carouselHeading} description={selectedData.carouselDescription} />
      <Footer fullName={selectedData.fullName} name={selectedData.name} theme={selectedTheme} />
    </div>
  )
}
