import hero from "../../assets/macan/hero.jpeg";
import background from "../../assets/macan/background.avif";
import performance from "../../assets/macan/performance.png";
import carousel2 from "../../assets/macan/carousel-1.jpeg";
import carousel1 from "../../assets/macan/carousel-2.jpeg";
import carousel3 from "../../assets/macan/carousel-3.jpg";
import carousel4 from "../../assets/macan/carousel-4.jpeg";
import carousel5 from "../../assets/macan/carousel-5.jpeg";
import carousel6 from "../../assets/macan/carousel-6.jpeg";
import carousel7 from "../../assets/macan/carousel-7.jpeg";
import carousel8 from "../../assets/macan/carousel-8.jpg";
import carousel9 from "../../assets/macan/carousel-9.jpeg";

export const macan = {
  name: "Macan GTS",
  fullName: "Porsche Macan GTS",
  theme: "macanGTS",
  carouselHeading: "Urban Sportiness, Everyday Versatility",
  carouselDescription: "Discover the Macan GTS's blend of compact agility, turbocharged power, and luxury features.",
  hero: {
    title: "Urban Sportiness",
    subtitle: "Compact. Powerful. Versatile.",
    description:
      "The Macan GTS is the ultimate compact SUV for city life, blending Porsche performance with everyday practicality.",
    image: hero,
    fullName: "Porsche Macan GTS",
  },
  highlights: {
    title: "City Meets Performance",
    description:
      "Agile, connected, and ready for any lifestyle—the Macan GTS is your ticket to urban adventure.",
    features: [
      {
        title: "Vehicle Concept",
        subtitle: "Macan GTS",
        description:
          "Compact SUV with a sporty chassis, turbocharged V6, and signature Porsche handling.",
      },
      {
        title: "Turbocharged Engine",
        subtitle: "2.9L V6",
        description:
          "The 2.9L twin-turbo V6 delivers 434 hp and 550 Nm for thrilling acceleration and city agility.",
      },
      {
        title: "Versatile Interior",
        subtitle: "Lifestyle Ready",
        description:
          "Spacious, tech-forward cabin with flexible cargo space and premium materials.",
      },
    ],
  },
  specs: {
    engine: "2.9L Twin-Turbo V6",
    power: "434 HP",
    torque: "550 Nm",
    transmission: "7-Speed PDK",
    topSpeed: "272 km/h",
    acceleration: "4.5s (0-100 km/h)",
  },
  detailedSpecs: {
    backgroundImage: background,
    Engine: [
      { label: "Number of Cylinders", value: "6" },
      { label: "Bore", value: "84.5 mm" },
      { label: "Stroke", value: "86.0 mm" },
      { label: "Displacement", value: "2,894 cc" },
      { label: "Max. engine power", value: "434 hp" },
      { label: "Max. engine torque", value: "550 Nm" },
      { label: "Max. engine speed", value: "6,800 rpm" },
      { label: "Engine type", value: "Twin-Turbocharged V6" },
    ],
    Transmission: [
      { label: "Drivetrain", value: "AWD" },
      { label: "Transmission", value: "7-speed PDK gearbox" },
      { label: "Gear ratios", value: "Urban optimized" },
      { label: "Launch control", value: "Yes" },
      { label: "Traction control", value: "PTM with ESP" },
    ],
    Dimensions: [
      { label: "Length", value: "4726 mm" },
      { label: "Width", value: "1922 mm" },
      { label: "Height", value: "1621 mm" },
      { label: "Wheelbase", value: "2807 mm" },
      { label: "Kerb Weight", value: "1895 kg" },
    ],
  },
  performanceSpecs: [
    {
      value: "272",
      unit: "KM/H",
      label: "TOP SPEED",
      color: "from-purple-500 to-pink-500",
    },
    {
      value: "4.5",
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
      title: "Turbocharged V6",
      description: "2.9L twin-turbo V6 delivers 434 hp and 550 Nm for thrilling city and highway performance.",
      image: carousel1,
      imageAlt: "Porsche Macan GTS engine",
    },
    {
      id: 2,
      title: "Compact Agility",
      description: "Sporty chassis and compact dimensions for nimble handling in urban environments.",
      image: carousel2,
      imageAlt: "Porsche Macan GTS concept",
    },
    {
      id: 3,
      title: "Versatile Interior",
      description: "Flexible cargo space, premium materials, and tech-forward design for everyday usability.",
      image: carousel3,
      imageAlt: "Porsche Macan GTS interior",
    },
    {
      id: 4,
      title: "7-Speed PDK",
      description: "The 7-speed PDK transmission delivers smooth, responsive shifts for city and spirited driving.",
      image: carousel4,
      imageAlt: "Porsche Macan GTS PDK",
    },
    {
      id: 5,
      title: "AWD System",
      description: "Porsche Traction Management (PTM) all-wheel drive system for confidence in all conditions.",
      image: carousel5,
      imageAlt: "Porsche Macan GTS AWD",
    },
    {
      id: 6,
      title: "Adaptive Suspension",
      description: "Porsche Active Suspension Management (PASM) adapts to road conditions for comfort and sportiness.",
      image: carousel6,
      imageAlt: "Porsche Macan GTS suspension",
    },
    {
      id: 7,
      title: "Braking System",
      description:
        "High-performance braking system for confident stopping power in city and spirited driving.",
      image: carousel7,
      imageAlt: "Porsche Macan GTS brakes",
    },
    {
      id: 8,
      title: "Lifestyle Ready",
      description:
        "Flexible cargo space and premium materials for an active, urban lifestyle.",
      image: carousel8,
      imageAlt: "Porsche Macan GTS lifestyle",
    },
    {
      id: 9,
      title: "Digital Cockpit",
      description:
        "Advanced infotainment and connectivity features for the modern driver.",
      image: carousel9,
      imageAlt: "Porsche Macan GTS digital cockpit",
    },
  ],
};
