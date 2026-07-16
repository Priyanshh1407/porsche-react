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
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function GT3RS() {
    const selectedTheme = carThemes.gt3rs;
    const selectedData = gt3rs;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const FadeUp = ({ children }) => (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );

    return <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 overflow-hidden">
        <Navbar theme={selectedTheme} />
        <Hero data={selectedData.hero} theme={selectedTheme} animateElements={true} />
        <FadeUp>
            <TrackStats theme={selectedTheme} />
        </FadeUp>
        <FadeUp>
            <Performance data={selectedData.performanceSpecs} theme={selectedTheme} image={selectedData.performanceImage} />
        </FadeUp>
        <FadeUp>
            <Highlights data={selectedData.highlights} theme={selectedTheme} />
        </FadeUp>
        <FadeUp>
            <Features data={selectedData.detailedSpecs} theme={selectedTheme} />
        </FadeUp>
        <FadeUp>
            <Carousel data={selectedData.carouselSlides} theme={selectedTheme} heading={selectedData.carouselHeading} description={selectedData.carouselDescription} />
        </FadeUp>
        <Footer fullName={selectedData.fullName} name={selectedData.name} theme={selectedTheme} />
    </div>
}