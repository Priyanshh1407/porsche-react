import Hero from "../../components/Hero";
import Highlights from "../../components/Highlights";
import Features from "../../components/Features";
import Performance from "../../components/Performance";
import Carousel from "../../components/Carousel";
import Gt4rsUniqueness from "../../components/Gt4rsUniqueness";
// import ChassisEngineering from "../../components/ChassisEngineering";

import { carThemes } from "../../data/carThemes";
import { cayman_gt4rs } from "../../data";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { useEffect } from "react";

export default function Cayman_GT4RS() {
  const selectedTheme = carThemes.caymanGT4;
  const selectedData = cayman_gt4rs;

  // Chassis engineering slides (ids 101-105)
  const chassisSlides = selectedData.carouselSlides.filter(slide =>
    [1, 2, 3, 4, 5, 6, 7].includes(slide.id)
  );
  // Remaining features slides (ids 1-7)
  const featureSlides = selectedData.carouselSlides.filter(slide =>
    [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].includes(slide.id)
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return <div className={`${selectedTheme.bgPattern}`}>
    <Navbar theme={selectedTheme} />
    <Hero data={selectedData.hero} theme={selectedTheme} />
    <Gt4rsUniqueness theme={selectedTheme} />
    <Carousel
      data={chassisSlides}
      theme={selectedTheme}
      heading="Chassis Engineering"
      description="Explore the GT4 RS's advanced chassis, lightweight construction, and motorsport-inspired suspension."
    />
    <Performance data={selectedData.performanceSpecs} theme={selectedTheme} image={selectedData.performanceImage} />
    <Features data={selectedData.detailedSpecs} theme={selectedTheme} />
    <Highlights data={selectedData.highlights} theme={selectedTheme} />
    <Carousel
      data={featureSlides}
      theme={selectedTheme}
      heading="Signature GT4 RS Features"
      description="Discover the aerodynamic, engine, and transmission highlights that set the GT4 RS apart."
    />
    <Footer fullName={selectedData.fullName} name={selectedData.name} theme={selectedTheme} />
  </div>
}