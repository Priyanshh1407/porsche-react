import hero from "../../assets/boxster/hero.avif";
import background from "../../assets/boxster/background.avif";
import performance from "../../assets/boxster/performance.png";
import carousel1 from "../../assets/boxster/carousel-1.avif";
import carousel2 from "../../assets/boxster/carousel-2.avif";
import carousel3 from "../../assets/boxster/carousel-3.jpeg";
import carousel4 from "../../assets/boxster/carousel-4.jpeg";
import carousel5 from "../../assets/boxster/carousel-5.jpeg";
import carousel6 from "../../assets/boxster/carousel-6.jpeg";

export const cayman_boxster = {
  name: "GT3 RS",
  fullName: "Porsche 911 GT3 RS",
  theme: "gt3rs",
  carouselHeading: "Open-Top Freedom, Mid-Engine Balance",
  carouselDescription: "Experience the Boxster/Cayman's convertible lifestyle, agility, and everyday usability.",
  hero: {
    title: "The All-New",
    subtitle: "Precision on Every Curve",
    description:
      "Experience the ultimate fusion of motorsport engineering and road-legal performance",
    image: hero,
    fullName: "Porsche 911 GT3 RS",
  },
  highlights: {
    title: "Take a journey,\nbend space",
    description:
      "See the start to the finish for contrails. With the shape change form and finish, grow your unique model for it says a new one energized shape to be seen of singular bright change both end.",
    features: [
      {
        title: "Vehicle Concept",
        subtitle: "GT3 RS",
        description:
          "The road-approved high-performance 911 GT3 RS sports car shows off its full potential on the track. With a high-speed naturally aspirated engine, radical downforce and comprehensive lightweight construction.",
      },
      {
        title: "Aerodynamics",
        subtitle: (
          <svg
            class="w-8 h-8 text-white-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        ),
        description:
          "Porsche Active Aerodynamics (PAA) continuously adjusts the downforce based on all car data. On straights, the Drag Reduction System (DRS) reduces drag.",
      },
      {
        title: "High-revving naturally aspirated engine",
        subtitle: (
          <svg
            class="w-8 h-8 text-white-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
          </svg>
        ), //engine image
        description:
          "A well-rehearsed motorsports team: The 4.0 I six-cylinder flat engine with individual throttle valve intake system in combination with the lightweight stainless steel sport exhaust system.",
      },
    ],
  },
  specs: {
    engine: "4.0L Flat-6",
    power: "518 HP",
    torque: "465 Nm",
    transmission: "7-Speed PDK",
    topSpeed: "296 km/h",
    acceleration: "3.2s (0-100 km/h)",
  },
  detailedSpecs: {
    backgroundImage: background,
    Engine: [
      { label: "Number of Cylinders", value: "6" },
      { label: "Bore", value: "102.0 mm" },
      { label: "Stroke", value: "81.5 mm" },
      { label: "Displacement", value: "3,966 cc" },
      { label: "Max. engine power", value: "518 hp" },
      { label: "Max. engine torque", value: "465 Nm" },
      { label: "Max. engine speed", value: "9,000 rpm" },
      { label: "Engine type", value: "Naturally Aspirated" },
    ],
    Transmission: [
      { label: "Drivetrain", value: "RWD" },
      { label: "Transmission", value: "7-speed PDK gearbox" },
      { label: "Gear ratios", value: "Sport optimized" },
      { label: "Launch control", value: "Yes" },
      { label: "Traction control", value: "PSM with ESP" },
    ],
    Dimensions: [
      { label: "Length", value: "4572 mm" },
      { label: "Width", value: "1900 mm" },
      { label: "Height", value: "1322 mm" },
      { label: "Wheelbase", value: "2457 mm" },
      { label: "Kerb Weight", value: "1450 kg" },
    ],
  },
  performanceSpecs: [
    {
      value: "205",
      unit: "MPH",
      label: "TOP SPEED",
      color: "from-red-500 to-orange-500",
    },
    {
      value: "3.2",
      unit: "SEC",
      label: "0-60 MPH",
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
  carouselSlidesOpenTop: [
    {
      id: 1,
      title: "Open-Top Freedom",
      description: "Fully automatic convertible roof opens in just 9 seconds for pure driving joy.",
      image: carousel1,
      imageAlt: "Boxster with roof down",
    },
    {
      id: 2,
      title: "Sunset Drives",
      description: "Experience the thrill of open-air motoring, perfect for golden hour and evening cruises.",
      image: carousel2,
      imageAlt: "Boxster at sunset",
    },
  ],
  carouselSlidesMain: [
    {
      id: 1,
      title: "Mid-Engine Balance",
      description: "In the 718 models, the mid-engine concept with boxer engine results in a low and central centre of gravity. For dynamic cornering and top driving performance.",
      image: carousel3,
      imageAlt: "Boxster mid-engine layout",
    },
    {
      id: 2,
      title: "Everyday Usability",
      description: "Comfortable, practical, and fun—ideal for daily driving and weekend escapes.",
      image: carousel4,
      imageAlt: "Boxster everyday usability",
    },
    {
      id: 3,
      title: "Agile Handling",
      description: "Sharp steering and lightweight chassis for a truly engaging drive.",
      image: carousel5,
      imageAlt: "Boxster agile handling",
    },
    {
      id: 4,
      title: "Lifestyle Ready",
      description: "Convertible fun meets Porsche performance for the ultimate lifestyle sports car.",
      image: carousel6,
      imageAlt: "Boxster lifestyle",
    },
  ],
};
