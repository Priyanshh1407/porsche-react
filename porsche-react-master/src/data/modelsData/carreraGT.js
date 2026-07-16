import hero from "../../assets/carreragt/hero.jpg";
import background from "../../assets/carreragt/background-2.jpeg";
import performance from "../../assets/carreragt/performance.png";
import carousel1 from "../../assets/carreragt/carousel-1.jpeg";
import carousel2 from "../../assets/carreragt/carousel-2.jpeg";
import carousel3 from "../../assets/carreragt/carousel-3.jpg";
import carousel4 from "../../assets/carreragt/carousel-4.jpeg";
import carousel5 from "../../assets/carreragt/carousel-5.jpeg";
import carousel6 from "../../assets/carreragt/carousel-6.jpeg";
import carousel7 from "../../assets/carreragt/carousel-7.jpg";
import carousel8 from "../../assets/carreragt/carousel-8.webp";

export const carreraGT = {
  name: "Carrera GT",
  fullName: "Porsche Carrera GT",
  theme: "carreragt",
  carouselHeading: "Analog Supercar Masterpiece",
  carouselDescription: "Discover the Carrera GT's racing roots, V10 power, and carbon-fiber innovation.",
  hero: {
    title: "The Icon Returns",
    subtitle: "V10 Glory Unleashed",
    description:
      "A rare blend of motorsport pedigree and timeless design. The Carrera GT stands as a beacon of analog performance.",
    image: hero,
    fullName: "The Carrera GT",
  },
  highlights: {
    title: "An Icon of its Era",
    description:
      "A masterpiece engineered with a racing soul. The Carrera GT merges carbon-fiber construction with a roaring V10 and six-speed manual.",
    features: [
      {
        title: "Vehicle Concept",
        subtitle: "Carrera GT",
        description:
          "Derived from Porsche's Le Mans project, the Carrera GT uses cutting-edge materials like carbon-fiber monocoque chassis and ceramic clutch for uncompromised track capability.",
      },
      {
        title: "Aerodynamics",
        subtitle: (
          <svg class="w-8 h-8 text-white-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        ),
        description:
          "Carbon-fiber body panels and an active rear spoiler optimize airflow and stability at high speeds.",
      },
      {
        title: "Naturally Aspirated V10",
        subtitle: (
          <svg class="w-8 h-8 text-white-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
          </svg>
        ),
        description:
          "A 5.7-liter V10 engine originally developed for endurance racing delivers raw, unfiltered power and a spine-tingling soundtrack.",
      },
    ],
  },
  specs: {
    engine: "5.7L V10",
    power: "612 HP",
    torque: "590 Nm",
    transmission: "6-Speed Manual",
    topSpeed: "330 km/h",
    acceleration: "3.9s (0-100 km/h)",
  },
  detailedSpecs: {
    backgroundImage: background,
    Engine: [
      { label: "Number of Cylinders", value: "10" },
      { label: "Bore", value: "98 mm" },
      { label: "Stroke", value: "76 mm" },
      { label: "Displacement", value: "5,733 cc" },
      { label: "Max. engine power", value: "612 hp" },
      { label: "Max. engine torque", value: "590 Nm" },
      { label: "Max. engine speed", value: "8,400 rpm" },
      { label: "Engine type", value: "Naturally Aspirated V10" },
    ],
    Transmission: [
      { label: "Drivetrain", value: "RWD" },
      { label: "Transmission", value: "6-speed manual" },
      { label: "Gear ratios", value: "Close-ratio" },
      { label: "Launch control", value: "Manual Skill" },
      { label: "Traction control", value: "None" },
    ],
    Dimensions: [
      { label: "Length", value: "4613 mm" },
      { label: "Width", value: "1921 mm" },
      { label: "Height", value: "1166 mm" },
      { label: "Wheelbase", value: "2730 mm" },
      { label: "Kerb Weight", value: "1380 kg" },
    ],
  },
  performanceSpecs: [
    {
      value: "330",
      unit: "KM/H",
      label: "TOP SPEED",
      color: "from-red-500 to-orange-500",
    },
    {
      value: "3.9",
      unit: "SEC",
      label: "0-100 KM/H",
      color: "from-yellow-400 to-amber-500",
    },
    {
      value: "6",
      unit: "SPEED",
      label: "MANUAL GEARBOX",
      color: "from-blue-400 to-cyan-500",
    },
  ],
  performanceImage: performance,
  carouselSlides: [
    {
      id: 1,
      title: "Le Mans Heritage",
      description: "Derived from Porsche's Le Mans prototype, the Carrera GT brings racing pedigree to the road.",
      image: carousel1,
      imageAlt: "Carrera GT Le Mans heritage",
    },
    {
      id: 2,
      title: "V10 Power",
      description: "A 5.7-liter naturally aspirated V10 engine delivers 612 hp and a spine-tingling soundtrack.",
      image: carousel2,
      imageAlt: "Carrera GT V10 engine",
    },
    {
      id: 3,
      title: "Carbon-Fiber Monocoque",
      description: "Lightweight carbon-fiber chassis and body panels for maximum rigidity and performance.",
      image: carousel3,
      imageAlt: "Carrera GT carbon-fiber body",
    },
    {
      id: 4,
      title: "Ceramic Clutch",
      description: "Motorsport-derived ceramic clutch (PCCC) for rapid engagement and durability.",
      image: carousel4,
      imageAlt: "Carrera GT ceramic clutch",
    },
    {
      id: 5,
      title: "Analog Driving",
      description: "No electronic aids—just a six-speed manual and pure driver connection.",
      image: carousel5,
      imageAlt: "Carrera GT analog controls",
    },
    {
      id: 6,
      title: "Active Aerodynamics",
      description: "Active rear wing deploys at speed for optimal downforce and stability.",
      image: carousel6,
      imageAlt: "Carrera GT aerodynamics",
    },
    {
      id: 7,
      title: "Racing Suspension",
      description: "Double-wishbone suspension and ceramic brakes for track-ready agility.",
      image: carousel7,
      imageAlt: "Carrera GT chassis",
    },
    {
      id: 8,
      title: "Lightweight Philosophy",
      description: "Carbon fiber everywhere—chassis, body, and seats for ultimate performance.",
      image: carousel8,
      imageAlt: "Carrera GT lightweight components",
    },
  ],
  legacy: {
    history: [
      {
        year: "2000",
        icon: "star",
        title: "Concept Revelation",
        description: "Porsche first unveiled the Carrera GT concept at the 2000 Paris Motor Show to massive acclaim.",
        badge: {
          text: "Concept",
          color: "from-yellow-400 to-orange-500"
        }
      },
      {
        year: "2004-2006",
        icon: "trophy",
        title: "Limited Production",
        description: "Only 1,270 units of the Carrera GT were produced, all hand-built in Leipzig.",
        badge: {
          text: "Limited",
          color: "from-red-400 to-pink-500"
        }
      },
      {
        year: "2010s",
        icon: "trending",
        title: "Collector's Dream",
        description: "As analog supercars became rare, the Carrera GT emerged as one of the most desirable collector cars in history."
      },
      {
        year: "2020+",
        icon: "award",
        title: "Blue Chip Icon",
        description: "The Carrera GT continues to gain value, recognized globally as a high-water mark in Porsche's performance legacy.",
        badge: {
          text: "Icon",
          color: "from-purple-400 to-blue-500"
        }
      }
    ],
    stats: [
      {
        value: "1,270",
        label: "Total Produced",
        color: "from-yellow-400 to-orange-500"
      },
      {
        value: "3 Years",
        label: "Production Run",
        color: "from-red-400 to-pink-500"
      },
      {
        value: "95%",
        label: "Survival Rate",
        color: "from-green-400 to-emerald-500"
      },
      {
        value: "#1",
        label: "Analog Icon",
        color: "from-purple-400 to-blue-500"
      }
    ],
    collector: {
      value: "$1.5M - $2.5M+",
      appreciation: "+450% (10 years)",
      status: "Collector's Grail"
    }
  }
};
