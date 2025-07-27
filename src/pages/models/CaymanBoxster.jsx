import Hero from "../../components/Hero";
import Highlights from "../../components/Highlights";
import Features from "../../components/Features";
import Performance from "../../components/Performance";
import Carousel from "../../components/Carousel";
import Convertible from "../../components/Convertible";
import OpenTopExperience from "../../components/OpenTopExperience";

import { carThemes } from "../../data/carThemes";
import { cayman_boxster } from "../../data";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";

export default function CaymanBoxster() {
  const selectedTheme = carThemes.boxsterS;
  const selectedData = cayman_boxster;

  return <div className={`${selectedTheme.bgPattern}`}>
    <Navbar theme={selectedTheme} />
    <Hero data={selectedData.hero} theme={selectedTheme} />
    <OpenTopExperience
  theme={selectedTheme}
  heading={selectedData.carouselHeading}
  description={selectedData.carouselDescription}
  slides={selectedData.carouselSlidesOpenTop}
/>
    <Features data={selectedData.detailedSpecs} theme={selectedTheme} />
    <Highlights data={selectedData.highlights} theme={selectedTheme} />
    <Performance data={selectedData.performanceSpecs} theme={selectedTheme} image={selectedData.performanceImage} />
    <Carousel data={selectedData.carouselSlidesMain} theme={selectedTheme} heading={selectedData.carouselHeading} description={selectedData.carouselDescription} />
    <Footer fullName={selectedData.fullName} name={selectedData.name} theme={selectedTheme} />
  </div>
}