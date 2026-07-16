import hero from "../../assets/918 spyder/hero.jpg";
import background from "../../assets/918 spyder/background.jpg";
import performance from "../../assets/918 spyder/performance.png";
import carousel1 from "../../assets/918 spyder/carousel-1.jpeg";
import carousel2 from "../../assets/918 spyder/carousel-2.jpeg";
import carousel3 from "../../assets/918 spyder/carousel-3.jpg";
import carousel4 from "../../assets/918 spyder/carousel-4.jpeg";
import carousel5 from "../../assets/918 spyder/carousel-5.jpeg";
import carousel6 from "../../assets/918 spyder/carousel-6.jpg";
import carousel7 from "../../assets/918 spyder/carousel-7.jpg";
import carousel8 from "../../assets/918 spyder/carousel-9.jpg";

export const spyder_918 = {
  name: "918 Spyder",
  fullName: "Porsche 918 Spyder",
  theme: "spyder918",
  carouselHeading: "Hybrid Hypercar Technology",
  carouselDescription: "Explore the 918 Spyder's hybrid power, carbon-fiber construction, and electrifying performance.",
  hero: {
    title: "Hybrid Hypercar",
    subtitle: "Electrifying Performance",
    description:
      "The 918 Spyder redefines the hypercar with a race-bred V8 and dual electric motors for instant torque and zero-emission capability.",
    image: hero,
    fullName: "Porsche 918 Spyder",
  },
  highlights: {
    title: "Future Meets Power",
    description:
      "A technological marvel, the 918 Spyder combines a high-revving V8 with advanced hybrid drive for record-breaking performance and efficiency.",
    features: [
      {
        title: "Vehicle Concept",
        subtitle: "918 Spyder",
        description:
          "Plug-in hybrid hypercar with carbon-fiber monocoque, all-wheel drive, and advanced aerodynamics.",
      },
      {
        title: "Hybrid System",
        subtitle: "V8 + Dual E-Motors",
        description:
          "4.6L naturally aspirated V8 paired with two electric motors for a combined 887 hp and 1280 Nm.",
      },
      {
        title: "E-Performance",
        subtitle: "Instant Torque",
        description:
          "Electric-only mode, hybrid mode, and race mode for ultimate versatility and performance.",
      },
    ],
  },
  specs: {
    engine: "4.6L V8 + 2 Electric Motors",
    power: "887 HP",
    torque: "1280 Nm",
    transmission: "7-Speed PDK",
    topSpeed: "340 km/h",
    acceleration: "2.6s (0-100 km/h)",
  },
  detailedSpecs: {
    backgroundImage: background,
    Engine: [
      { label: "Number of Cylinders", value: "8 (V8) + 2 e-motors" },
      { label: "Bore", value: "95.0 mm" },
      { label: "Stroke", value: "76.0 mm" },
      { label: "Displacement", value: "4,593 cc" },
      { label: "Max. engine power", value: "608 hp (V8) + 279 hp (e-motors)" },
      { label: "Max. engine torque", value: "528 Nm (V8) + 918 Nm (e-motors)" },
      { label: "Max. engine speed", value: "9,150 rpm" },
      { label: "Engine type", value: "Naturally Aspirated V8 + Hybrid" },
    ],
    Transmission: [
      { label: "Drivetrain", value: "AWD (hybrid)" },
      { label: "Transmission", value: "7-speed PDK gearbox" },
      { label: "Gear ratios", value: "Hybrid optimized" },
      { label: "Launch control", value: "Yes" },
      { label: "Traction control", value: "Hybrid system" },
    ],
    Dimensions: [
      { label: "Length", value: "4643 mm" },
      { label: "Width", value: "1940 mm" },
      { label: "Height", value: "1167 mm" },
      { label: "Wheelbase", value: "2730 mm" },
      { label: "Kerb Weight", value: "1675 kg" },
    ],
  },
  performanceSpecs: [
    {
      value: "340",
      unit: "KM/H",
      label: "TOP SPEED",
      color: "from-yellow-500 to-purple-500",
    },
    {
      value: "2.6",
      unit: "SEC",
      label: "0-100 KM/H",
      color: "from-green-400 to-blue-500",
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
      title: "Hybrid System",
      description: "4.6L V8 and two electric motors deliver a combined 887 hp and 1280 Nm.",
      image: carousel1,
      imageAlt: "Porsche 918 Spyder hybrid system",
    },
    {
      id: 2,
      title: "E-Performance",
      description: "Electric-only mode, hybrid mode, and race mode for ultimate versatility and performance.",
      image: carousel2,
      imageAlt: "Porsche 918 Spyder e-performance",
    },
    {
      id: 3,
      title: "Carbon-Fiber Monocoque",
      description: "Lightweight carbon-fiber chassis for strength, agility, and safety.",
      image: carousel3,
      imageAlt: "Porsche 918 Spyder chassis",
    },
    {
      id: 4,
      title: "All-Wheel Drive",
      description: "Hybrid all-wheel drive system for maximum traction and control.",
      image: carousel4,
      imageAlt: "Porsche 918 Spyder AWD",
    },
    {
      id: 5,
      title: "7-Speed PDK",
      description: "The 7-speed PDK transmission delivers seamless power and efficiency.",
      image: carousel5,
      imageAlt: "Porsche 918 Spyder PDK",
    },
    {
      id: 6,
      title: "Regenerative Brakes",
      description: "Regenerative and carbon-ceramic brakes for optimal stopping power and energy recovery.",
      image: carousel6,
      imageAlt: "Porsche 918 Spyder brakes",
    },
    {
      id: 7,
      title: "Lightweight Construction",
      description: "Extensive use of carbon fiber and lightweight materials for maximum performance.",
      image: carousel7,
      imageAlt: "Porsche 918 Spyder lightweight components",
    },
    {
      id: 8,
      title: "High-Tech Performance Cabin",
      description: "A blend of luxury and innovation featuring carbon-fiber bucket seats, touchscreen center console, digital instrument cluster, and a driver-focused layout inspired by motorsport.",
      image: carousel8,
      imageAlt: "Porsche 918 Spyder high-tech interior",
    }

  ],
};
