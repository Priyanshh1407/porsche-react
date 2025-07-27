import Hero from "../../components/Hero";
import Highlights from "../../components/Highlights";
import Features from "../../components/Features";
import Performance from "../../components/Performance";
import Carousel from "../../components/Carousel";
import CityDriveFocus from "../../components/CityDriveFocus";

import { carThemes } from "../../data/carThemes";
import { macan } from "../../data";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";

export default function Macan() {
    const selectedTheme = carThemes.macanGTS;
    const selectedData = macan;

    return <div className={`${selectedTheme.bgPattern}`}>
        <Navbar theme={selectedTheme} />
        <Hero data={selectedData.hero} theme={selectedTheme} />
        <CityDriveFocus theme={selectedTheme} />
        <Highlights data={selectedData.highlights} theme={selectedTheme} />
        <Features data={selectedData.detailedSpecs} theme={selectedTheme} />
        <Performance data={selectedData.performanceSpecs} theme={selectedTheme} image={selectedData.performanceImage} />
        <Carousel data={selectedData.carouselSlides} theme={selectedTheme} heading={selectedData.carouselHeading} description={selectedData.carouselDescription} />
        <Footer fullName={selectedData.fullName} name={selectedData.name} theme={selectedTheme} />
    </div>
}