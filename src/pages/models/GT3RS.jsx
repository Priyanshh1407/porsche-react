import Hero from "../../components/Hero";
import Highlights from "../../components/Highlights";
import Features from "../../components/Features";
import Performance from "../../components/Performance";
import Carousel from "../../components/Carousel";
import TrackStats from "../../components/TrackStats";

import { carThemes } from "../../data/carThemes";
import { gt3rs } from "../../data";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";

export default function GT3RS() {
    const selectedTheme = carThemes.gt3rs;
    const selectedData = gt3rs;

    return <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
        <Navbar theme={selectedTheme} />
        <Hero data={selectedData.hero} theme={selectedTheme} />
        <TrackStats theme={selectedTheme} />
        <Performance data={selectedData.performanceSpecs} theme={selectedTheme} image={selectedData.performanceImage} />
        <Highlights data={selectedData.highlights} theme={selectedTheme} />
        <Features data={selectedData.detailedSpecs} theme={selectedTheme} />
        <Carousel data={selectedData.carouselSlides} theme={selectedTheme} heading={selectedData.carouselHeading} description={selectedData.carouselDescription} />
        <Footer fullName={selectedData.fullName} name={selectedData.name} theme={selectedTheme} />
    </div>
}