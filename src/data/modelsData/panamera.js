import hero from "../../assets/panamera/hero.webp";
import background from "../../assets/panamera/background.webp";
import performance from "../../assets/panamera/performance.avif";
import carousel1 from "../../assets/panamera/carousel-1.avif";
import carousel2 from "../../assets/panamera/carousel-2.avif";
import carousel3 from "../../assets/panamera/carousel-3.jpg";
import carousel4 from "../../assets/panamera/carousel-4.jpeg";
import carousel5 from "../../assets/panamera/carousel-5.jpeg";
import carousel6 from "../../assets/panamera/carousel-6.jpeg";
import carousel7 from "../../assets/panamera/carousel-7.avif";
import carousel8 from "../../assets/panamera/carousel-8.avif";

export const panamera = {
  name: "Panamera",
  fullName: "Porsche Panamera Turbo S E-Hybrid",
  theme: "panamera",
  carouselHeading: "Luxury Grand Touring",
  carouselDescription: "See how the Panamera redefines the luxury GT with hybrid power, comfort, and advanced tech.",
  hero: {
    title: "Luxury Grand Touring",
    subtitle: "Performance Meets Comfort",
    description: "The Panamera redefines the luxury GT with executive comfort, advanced tech, and electrifying performance.",
    image: background
  },
  highlights: {
    title: "Luxury Meets Power",
    description: "A true grand tourer, the Panamera blends sports car performance with limousine-like comfort and versatility.",
    features: [
      {
        title: "Vehicle Concept",
        subtitle: "Panamera Turbo S E-Hybrid",
        description: "Four-door luxury GT with plug-in hybrid powertrain, adaptive air suspension, and executive rear seating."
      },
      {
        title: "Hybrid Power",
        subtitle: "V8 + Electric Motor",
        description: "4.0L twin-turbo V8 paired with an electric motor for a combined 700 hp and 870 Nm."
      },
      {
        title: "Executive Comfort",
        subtitle: "Rear Seat Luxury",
        description: "Heated, ventilated, and massaging rear seats, four-zone climate control, and advanced infotainment."
      }
    ]
  },
  specs: {
    engine: "4.0L Twin-Turbo V8 + Electric Motor",
    power: "700 HP",
    torque: "870 Nm",
    transmission: "8-Speed PDK",
    topSpeed: "315 km/h",
    acceleration: "3.2s (0-100 km/h)"
  },
  detailedSpecs: {
    backgroundImage: hero,
    Engine: [
      { label: 'Number of Cylinders', value: '8' },
      { label: 'Bore', value: '86.0 mm' },
      { label: 'Stroke', value: '86.0 mm' },
      { label: 'Displacement', value: '3,996 cc' },
      { label: 'Max. engine power', value: '700 hp' },
      { label: 'Max. engine torque', value: '870 Nm' },
      { label: 'Max. engine speed', value: '6,800 rpm' },
      { label: 'Engine type', value: 'Twin-Turbocharged V8 + Electric' },
    ],
    Transmission: [
      { label: 'Drivetrain', value: 'AWD' },
      { label: 'Transmission', value: '8-speed PDK gearbox' },
      { label: 'Gear ratios', value: 'GT optimized' },
      { label: 'Launch control', value: 'Yes' },
      { label: 'Traction control', value: 'PTM with ESP' },
    ],
    Dimensions: [
      { label: 'Length', value: '5049 mm' },
      { label: 'Width', value: '1937 mm' },
      { label: 'Height', value: '1423 mm' },
      { label: 'Wheelbase', value: '2950 mm' },
      { label: 'Kerb Weight', value: '2370 kg' },
    ]
  },
  performanceSpecs: [
    { value: "315", unit: "KM/H", label: "TOP SPEED", color: "from-amber-600 to-yellow-600" },
    { value: "3.2", unit: "SEC", label: "0-100 KM/H", color: "from-yellow-400 to-amber-500" },
    { value: "8", unit: "SPEED", label: "PDK GEARBOX", color: "from-blue-400 to-cyan-500" }
  ],
  carouselSlides: [
    {
      id: 1,
      title: "Hybrid Powertrain",
      description: "4.0L twin-turbo V8 paired with an electric motor for a combined 700 hp and 870 Nm.",
      image: carousel1,
      imageAlt: "Porsche Panamera hybrid system",
    },
    {
      id: 2,
      title: "Matrix LED Headlights",
      description: "Equipped with Matrix LED headlights as standard, the optional HD Matrix LED headlights with over 64,000 pixels increase functionality and safety even further (included as standard with the Panamera Turbo E-Hybrid models).",
      image: carousel2,
      imageAlt: "Porsche Panamera matrix headlights",
    },
    {
      id: 3,
      title: "Executive Comfort",
      description: "Heated, ventilated, and massaging rear seats, four-zone climate control, and advanced infotainment.",
      image: carousel3,
      imageAlt: "Porsche Panamera executive comfort",
    },
    {
      id: 4,
      title: "Adaptive Air Suspension",
      description: "Adaptive air suspension provides the perfect balance between comfort and sportiness.",
      image: carousel4,
      imageAlt: "Porsche Panamera suspension",
    },
    {
      id: 5,
      title: "All-Wheel Drive",
      description: "Porsche Traction Management (PTM) all-wheel drive system for confidence in all conditions.",
      image: carousel5,
      imageAlt: "Porsche Panamera AWD",
    },
    {
      id: 6,
      title: "8-Speed PDK",
      description: "The 8-speed PDK transmission delivers smooth, responsive shifts for comfort and performance.",
      image: carousel6,
      imageAlt: "Porsche Panamera PDK",
    },
    {
      id: 7,
      title: "Luxury Interior",
      description: "Spacious, tech-forward cabin with premium materials and advanced infotainment.",
      image: carousel7,
      imageAlt: "Porsche Panamera luxury interior",
    },
    {
      id: 8,
      title: "Rear-axle Steering",
      description: "Available as an option, rear-axle steering enhances performance and suitability for day-to-day usability in equal measure. At low speeds, the turning circle is reduced, agility is increased and parking becomes noticeably easier to manage. At higher speeds, driving stability is increased. The result: greater manoeuvrability and driving safety in everyday use.",
      image: carousel8,
      imageAlt: "Porsche Panamera rear-axle steering",
    },
  ]
};