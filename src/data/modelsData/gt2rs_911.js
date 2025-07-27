import hero from "../../assets/gt2rs/hero.jpeg";
import background from "../../assets/gt2rs/background.jpeg";
import performance from "../../assets/gt2rs/performance.png";
import carousel1 from "../../assets/gt2rs/carousel-1.jpeg";
import carousel2 from "../../assets/gt2rs/carousel-2.jpeg";
import carousel3 from "../../assets/gt2rs/carousel-3.jpg";
import carousel4 from "../../assets/gt2rs/carousel-4.jpeg";
import carousel5 from "../../assets/gt2rs/carousel-5.jpeg";
import carousel6 from "../../assets/gt2rs/carousel-6.jpeg";
import carousel7 from "../../assets/gt2rs/carousel-7.jpeg";
import carousel8 from "../../assets/gt2rs/carousel-8.jpeg";
import carousel9 from "../../assets/gt2rs/carousel-9.jpeg";

export const gt2rs_911 = {
  name: "GT2 RS",
  fullName: "Porsche 911 GT2 RS",
  theme: "gt2rs",
  carouselHeading: "Raw Power, Uncompromised",
  carouselDescription: "Experience the GT2 RS's extreme performance, advanced aerodynamics, and motorsport technology.",
  hero: {
    title: "The Widow Maker",
    subtitle: "Raw Power. No Apologies.",
    description:
      "The most powerful 911 ever built. Twin-turbocharged, rear-wheel drive, and engineered for the brave.",
    image: hero,
    fullName: "Porsche 911 GT2 RS",
  },
  highlights: {
    title: "Unleash the Beast",
    description:
      "A legend born on the track, the GT2 RS is the ultimate expression of Porsche's motorsport DNA. Extreme power, minimal weight, and a chassis tuned for the edge.",
    features: [
      {
        title: "Vehicle Concept",
        subtitle: "GT2 RS",
        description:
          "Twin-turbocharged 3.8L flat-six, rear-wheel drive, and a focus on pure, unfiltered performance.",
      },
      {
        title: "Aerodynamics",
        subtitle: "Aggressive Aero Kit",
        description:
          "Large rear wing, front splitter, and active elements maximize downforce and stability at high speed.",
      },
      {
        title: "Twin-Turbo Engine",
        subtitle: "700 HP",
        description:
          "The 3.8L twin-turbo flat-six delivers 700 hp and 750 Nm, launching the GT2 RS to 100 km/h in just 2.7 seconds.",
      },
    ],
  },
  specs: {
    engine: "3.8L Twin-Turbo Flat-6",
    power: "700 HP",
    torque: "750 Nm",
    transmission: "7-Speed PDK",
    topSpeed: "340 km/h",
    acceleration: "2.7s (0-100 km/h)",
  },
  detailedSpecs: {
    backgroundImage: background,
    Engine: [
      { label: "Number of Cylinders", value: "6" },
      { label: "Bore", value: "102.0 mm" },
      { label: "Stroke", value: "77.5 mm" },
      { label: "Displacement", value: "3,800 cc" },
      { label: "Max. engine power", value: "700 hp" },
      { label: "Max. engine torque", value: "750 Nm" },
      { label: "Max. engine speed", value: "7,200 rpm" },
      { label: "Engine type", value: "Twin-Turbocharged" },
    ],
    Transmission: [
      { label: "Drivetrain", value: "RWD" },
      { label: "Transmission", value: "7-speed PDK gearbox" },
      { label: "Gear ratios", value: "Track optimized" },
      { label: "Launch control", value: "Yes" },
      { label: "Traction control", value: "PSM with ESP" },
    ],
    Dimensions: [
      { label: "Length", value: "4549 mm" },
      { label: "Width", value: "1880 mm" },
      { label: "Height", value: "1297 mm" },
      { label: "Wheelbase", value: "2450 mm" },
      { label: "Kerb Weight", value: "1470 kg" },
    ],
  },
  performanceSpecs: [
    {
      value: "340",
      unit: "KM/H",
      label: "TOP SPEED",
      color: "from-red-600 to-orange-600",
    },
    {
      value: "2.7",
      unit: "SEC",
      label: "0-100 KM/H",
      color: "from-yellow-400 to-amber-500",
    },
    {
      value: "7",
      unit: "SPEED",
      label: "PDK GEARBOX",
      color: "from-blue-400 to-cyan-500",
    },
  ],
  performanceImage: performance,
  carouselSlides: [
    {
      id: 1,
      title: "Twin-Turbo Power",
      description: "3.8L twin-turbo flat-six producing 700 hp and 750 Nm for breathtaking acceleration.",
      image: carousel1,
      imageAlt: "Porsche GT2 RS engine",
    },
    {
      id: 2,
      title: "Rear-Wheel Drive",
      description: "Pure rear-wheel drive layout for maximum driver engagement and motorsport feel.",
      image: carousel2,
      imageAlt: "Porsche GT2 RS chassis",
    },
    {
      id: 3,
      title: "Carbon Ceramic Brakes",
      description: "High-performance ceramic composite brakes provide exceptional stopping power and fade resistance.",
      image: carousel3,
      imageAlt: "Porsche GT2 RS brakes",
    },
    {
      id: 4,
      title: "Active Aerodynamics",
      description: "Aggressive aero kit with large rear wing and DRS for maximum downforce and stability.",
      image: carousel4,
      imageAlt: "Porsche GT2 RS aerodynamics",
    },
    {
      id: 5,
      title: "Lightweight Philosophy",
      description: "Extensive use of carbon fiber and lightweight materials for maximum performance.",
      image: carousel5,
      imageAlt: "Porsche GT2 RS lightweight components",
    },
    {
      id: 6,
      title: "7-Speed PDK",
      description: "The 7-speed PDK transmission delivers lightning-fast shifts and optimal power delivery.",
      image: carousel6,
      imageAlt: "Porsche PDK gearbox",
    },
    {
      id: 7,
      title: "Rear-Axle Steering",
      description: "Rear-axle steering increases agility at low speeds and stability at high speeds.",
      image: carousel7,
      imageAlt: "Porsche rear-axle steering system",
    },
    {
      id: 8,
      title: "Carbon Fiber Components",
      description: "Carbon fiber dashboard elements, door panels, and trim pieces reduce overall weight while delivering authentic motorsport styling.",
      image: carousel8,
      imageAlt: "Porsche GT2 RS carbon fiber dashboard and interior trim",
    },
    {
      id: 9,
      title: "Carbon Fiber Racing Seats",
      description: "Lightweight carbon fiber bucket seats provide exceptional lateral support and weight savings for optimal track performance.",
      image: carousel9,
      imageAlt: "Porsche GT2 RS carbon fiber racing bucket seats",
    }
  ],
};
