import React from "react";
import porscheProfile from "../assets/caymangt4/porsche-profile.jpeg";

export default function Gt4rsUniqueness() {
    return (
        <section className="w-full h-screen relative overflow-hidden bg-background">
            {/* Main container - exact 50/50 split */}
            <div className="absolute inset-0 flex">

                {/* Left side - Pure white background with text content */}
                <div className="w-1/2 flex flex-col justify-center bg-transparent px-20 xl:px-24 2xl:px-28 py-20">
                    <div className="max-w-lg">
                        <h1 className="text-[5rem] xl:text-[6rem] 2xl:text-[7rem] font-light leading-[0.85] tracking-tight text-white mb-16 xl:mb-20">
                            Perfectly<br />
                            irrational.
                        </h1>
                        <p className="text-sm xl:text-base leading-relaxed text-white font-light max-w-md">
                            A razor-sharp track tool. A highly agile mid-engine con-<br />
                            cept. A six-cylinder naturally aspirated engine with a dis-<br />
                            placement of 4 litres and 368 kW (500 PS). A high-revving<br />
                            concept that easily hits the 9,000 mark. Rational? Not al-<br />
                            ways. Perfect? Always.
                        </p>
                    </div>
                </div>

                {/* Right side - Single full-height image */}
                <div className="w-1/2 relative overflow-hidden">
                    <img
                        src={porscheProfile}
                        alt="Porsche 718 Cayman GT4 RS"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

        </section>
    );
}