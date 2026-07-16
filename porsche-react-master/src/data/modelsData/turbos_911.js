import hero from "../../assets/turboS/hero.avif";
import performnce from "../../assets/turboS/performance.png";
import background from "../../assets/turboS/background.jpg";
import carousel1 from "../../assets/turboS/carousel-1.jpg";
import carousel2 from "../../assets/turboS/carousel-2.jpg";
import carousel3 from "../../assets/turboS/carousel-3.jpg";
import carousel4 from "../../assets/turboS/carousel-4.jpg";
import carousel5 from "../../assets/turboS/carousel-5.jpg";
import carousel6 from "../../assets/turboS/carousel-6.avif";
import carousel7 from "../../assets/turboS/carousel-7.avif";


export const turbos_911 = {
  name: "911 Turbo",
  fullName: "Porsche 911 Turbo S",
  theme: "911turbo",
  carouselHeading: "Everyday Supercar",
  carouselDescription: "See how the 911 Turbo S blends daily usability with devastating performance and advanced tech.",
  hero: {
    title: "The All-New",
    subtitle: "Turbocharged Excellence",
    description: "Where luxury meets uncompromising performance",
    image: hero
  },
  highlights: {
    title: "Power meets\nSophistication",
    description: "Experience the perfect balance of everyday usability and track-ready performance with advanced turbocharging technology.",
    features: [
      {
        title: "Twin-Turbo Engine",
        subtitle: "3.8L",
        description: "The twin-turbocharged flat-six engine delivers exceptional power with remarkable efficiency and instantaneous response."
      },
      {
        title: "All-Wheel Drive",
        icon: "settings",
        description: "Porsche Traction Management (PTM) all-wheel drive system ensures optimal traction and stability in all conditions."
      },
      {
        title: "Adaptive Aerodynamics",
        image: "/assets/images/911turbo-aero.png",
        description: "Active aerodynamics system automatically adjusts to optimize downforce and reduce drag for maximum performance."
      }
    ]
  },
  specs: {
    engine: "3.8L Twin-Turbo Flat-6",
    power: "640 HP",
    torque: "800 Nm",
    transmission: "8-Speed PDK",
    topSpeed: "330 km/h",
    acceleration: "2.7s (0-100 km/h)"
  },
  detailedSpecs: {
    backgroundImage: background,
    Engine: [
      { label: 'Number of Cylinders', value: '6' },
      { label: 'Bore', value: '95.0 mm' },
      { label: 'Stroke', value: '85.0 mm' },
      { label: 'Displacement', value: '3,745 cc' },
      { label: 'Max. engine power', value: '640 hp' },
      { label: 'Max. engine torque', value: '800 Nm' },
      { label: 'Max. engine speed', value: '7,200 rpm' },
      { label: 'Engine type', value: 'Twin-Turbocharged' },
    ],
    Transmission: [
      { label: 'Drivetrain', value: 'AWD' },
      { label: 'Transmission', value: '8-speed PDK gearbox' },
      { label: 'Gear ratios', value: 'Performance optimized' },
      { label: 'Launch control', value: 'Yes' },
      { label: 'Traction control', value: 'PTM with ESP' },
    ],
    Dimensions: [
      { label: 'Length', value: '4519 mm' },
      { label: 'Width', value: '1900 mm' },
      { label: 'Height', value: '1303 mm' },
      { label: 'Wheelbase', value: '2450 mm' },
      { label: 'Kerb Weight', value: '1640 kg' },
    ]
  },
  performanceSpecs: [
    { value: "205", unit: "MPH", label: "TOP SPEED", color: "from-red-500 to-orange-500" },
    { value: "2.7", unit: "SEC", label: "0-60 MPH", color: "from-yellow-400 to-amber-500" },
    { value: "8", unit: "SPEED", label: "PDK GEARBOX", color: "from-blue-400 to-cyan-500" }
  ],
  performanceImage: performnce,
  carouselSlides: [
    {
      id: 1,
      title: "Twin-Turbo Excellence",
      description: "3.8L twin-turbo flat-six delivers 640 hp and 800 Nm for devastating performance.",
      image: carousel1,
      imageAlt: "Porsche 911 Turbo S engine",
    },
    {
      id: 2,
      title: "All-Wheel Drive",
      description: "Porsche Traction Management (PTM) has been continuously developed. It is now more robust and offers improved control. The result: increased precision and resilience.",
      image: carousel2,
      imageAlt: "Porsche PTM system",
    },
    {
      id: 3,
      title: "8-Speed PDK",
      description: "The completely re-developed 8-speed Porsche Doppelkupplung (PDK) allows extremely fast gear changes without an interruption in traction – in a matter of milliseconds. ",
      image: carousel3,
      imageAlt: "Porsche 8-speed PDK",
    },
    {
      id: 4,
      title: "Sport Chrono Package",
      description: "Integrated Sport Chrono Package with dynamic transmission mounts and performance-oriented driving modes.",
      image: carousel4,
      imageAlt: "Porsche Sport Chrono",
    },
    {
      id: 5,
      title: "Active Aerodynamics",
      description: "The aerodynamic system makes the 911 Turbo models aerodynamically flexible in any situation. Features include active air intake flaps, pneumatically extendible front spoiler and variable rear wing for optimum performance.",
      image: carousel5,
      imageAlt: "Porsche 911 Turbo S aerodynamics",
    },
    {
      id: 6,
      title: "Luxury Interior",
      description: "Uncompromising sportiness combined with high comfort and exclusive feel. Features two-tone leather interior with contrasting stitching, matt carbon decorative inserts and adaptive sports seats Plus (18-way).",
      image: carousel6,
      imageAlt: "Porsche 911 Turbo S interior",
    },
    {
      id: 7,
      title: "Lighting and Assistance Systems",
      description: "Advanced assistance systems including Porsche Wet mode for safer handling on wet roads and Porsche InnoDrive for anticipatory speed control. LED main headlights with matrix technology provide exceptional visibility.",
      image: carousel7,
      imageAlt: "Porsche 911 Turbo S lights",
    },
  ]
};