import React from 'react'
import { carThemes } from '../../data/carThemes';
import { panamera } from '../../data/modelsData/panamera'
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import Highlights from '../../components/Highlights';
import Performance from '../../components/Performance';
import Features from '../../components/Features';
import Carousel from '../../components/Carousel';
import Footer from '../../components/Footer';
import InteriorComforts from "../../components/InteriorComforts";

export default function Panamera() {
  const selectedTheme = carThemes.panamera;
  const selectedData = panamera;

  return (
    <div className={`${selectedTheme.bgPattern}`}>
      <Navbar theme={selectedTheme} />
      <Hero data={selectedData.hero} theme={selectedTheme} />
      <InteriorComforts theme={selectedTheme} />
      <Highlights data={selectedData.highlights} theme={selectedTheme} />
      <Features data={selectedData.detailedSpecs} theme={selectedTheme} />
      <Carousel data={selectedData.carouselSlides} theme={selectedTheme} heading={selectedData.carouselHeading} description={selectedData.carouselDescription} />
      <Footer fullName={selectedData.fullName} name={selectedData.name} theme={selectedTheme} />
    </div>
  )
}
