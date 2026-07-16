import hero from "../../assets/taycan/hero.jpeg";
import background from "../../assets/taycan/background.jpg";
import performance from "../../assets/taycan/performance.avif";
import carousel1 from "../../assets/taycan/carousel-1.webp";
import carousel2 from "../../assets/taycan/carousel-2.avif";
import carousel3 from "../../assets/taycan/carousel-3.jpeg";
import carousel4 from "../../assets/taycan/carousel-4.jpeg";
import carousel5 from "../../assets/taycan/carousel-5.avif";
import carousel6 from "../../assets/taycan/carousel-6.jpeg";
import carousel7 from "../../assets/taycan/carousel-7.jpeg";
import carousel8 from "../../assets/taycan/carousel-8.jpg";
import carousel9 from "../../assets/taycan/carousel-9.jpg";
import carousel10 from "../../assets/taycan/carousel-10.jpg";

export const taycan = {
  name: "Taycan",
  fullName: "Porsche Taycan Turbo S",
  theme: "taycan",
  hero: {
    title: "The All-New",
    subtitle: "Electric. Intensified.",
    description: "The future of performance is here",
    image: hero
  },
  highlights: {
    title: "Electric\nPerformance",
    description: "Zero emissions, maximum emotions. The Taycan represents the future of sports car performance with instant torque and whisper-quiet acceleration.",
    features: [
      {
        title: "Electric Performance",
        subtitle: "Dual Motor",
        description: "Two permanently excited synchronous motors deliver instant torque and breathtaking acceleration while maintaining Porsche's legendary handling."
      },
      {
        title: "800V Architecture",
        icon: "zap",
        description: "Revolutionary 800-volt architecture enables ultra-rapid charging and exceptional efficiency for extended range."
      },
      {
        title: "Regenerative Braking",
        image: "/assets/images/taycan-charging.png",
        description: "Advanced recuperation system recovers energy during braking, maximizing range while maintaining optimal performance."
      }
    ]
  },
  specs: {
    engine: "Dual Electric Motors",
    power: "761 HP",
    torque: "1050 Nm",
    transmission: "2-Speed Automatic",
    topSpeed: "260 km/h",
    acceleration: "2.8s (0-100 km/h)"
  },
  detailedSpecs: {
    backgroundImage: background,
    Engine: [
      { label: 'Motor Type', value: 'Dual Synchronous Motors' },
      { label: 'Front Motor Power', value: '190 kW' },
      { label: 'Rear Motor Power', value: '375 kW' },
      { label: 'Battery Capacity', value: '93.4 kWh' },
      { label: 'Max. system power', value: '761 hp' },
      { label: 'Max. system torque', value: '1050 Nm' },
      { label: 'Voltage', value: '800V Architecture' },
      { label: 'Drive Type', value: 'All-Electric AWD' },
    ],
    Transmission: [
      { label: 'Drivetrain', value: 'AWD' },
      { label: 'Transmission', value: '2-speed automatic (rear)' },
      { label: 'Front Axle', value: 'Single-speed' },
      { label: 'Launch control', value: 'Yes' },
      { label: 'Traction control', value: 'Electric AWD' },
    ],
    Dimensions: [
      { label: 'Length', value: '4963 mm' },
      { label: 'Width', value: '1966 mm' },
      { label: 'Height', value: '1378 mm' },
      { label: 'Wheelbase', value: '2900 mm' },
      { label: 'Kerb Weight', value: '2295 kg' },
    ]
  },
  performanceSpecs: [
    { value: "161", unit: "MPH", label: "TOP SPEED", color: "from-blue-500 to-purple-500" },
    { value: "2.8", unit: "SEC", label: "0-60 MPH", color: "from-yellow-400 to-amber-500" },
    { value: "270", unit: "MILES", label: "RANGE", color: "from-green-400 to-emerald-500" }
  ],
  performanceImage: performance,
  carouselHeading: "Electric Performance, Digital Luxury",
  carouselDescription: "Discover the Taycan's instant torque, advanced tech, and electric driving experience.",
  carouselSlides: [
    {
      id: 1,
      title: "Electric Performance",
      description: "Two permanently excited synchronous motors deliver instant torque and breathtaking acceleration while maintaining Porsche's legendary handling.",
      image: carousel1,
      imageAlt: "Porsche Taycan electric performance"
    },
    {
      id: 2,
      title: "800V Architecture",
      description: "Revolutionary 800-volt architecture enables ultra-rapid charging and exceptional efficiency for extended range and reduced charging times.",
      image: carousel2,
      imageAlt: "Porsche Taycan 800V charging"
    },
    {
      id: 3,
      title: "Regenerative Braking",
      description: "Advanced recuperation system recovers energy during braking, maximizing range while maintaining optimal performance and brake feel.",
      image: carousel3,
      imageAlt: "Porsche Taycan regenerative braking"
    },
    {
      id: 4,
      title: "Dual Motor System",
      description: "Sophisticated dual-motor all-wheel drive system provides precise power delivery and exceptional traction in all conditions.",
      image: carousel4,
      imageAlt: "Porsche Taycan dual motors"
    },
    {
      id: 5,
      title: "2-Speed Transmission",
      description: "Innovative 2-speed transmission on the rear axle optimizes efficiency at low speeds and performance at high speeds.",
      image: carousel5,
      imageAlt: "Porsche Taycan 2-speed transmission"
    },
    {
      id: 6,
      title: "Battery Technology",
      description: "High-performance lithium-ion battery with 93.4 kWh capacity provides exceptional range and rapid charging capabilities.",
      image: carousel6,
      imageAlt: "Porsche Taycan battery system"
    },
    {
      id: 7,
      title: "Adaptive Air Suspension",
      description: "Three-chamber air suspension with adaptive dampers provides the perfect balance between comfort and sportiness.",
      image: carousel7,
      imageAlt: "Porsche Taycan air suspension"
    },
    {
      id: 8,
      title: "Electric Braking System",
      description: "Advanced electric braking system combines regenerative braking with traditional brakes for optimal efficiency and performance.",
      image: carousel8,
      imageAlt: "Porsche Taycan braking system"
    },
    {
      id: 9,
      title: "Headlights",
      description: "Recognisable from afar, day or night: the characteristic Porsche 4-point design on the camera-controlled matrix LED headlights and the HD matrix LED main headlights that come as standard on Turbo models.",
      image: carousel9,
      imageAlt: "Porsche Taycan headlights"
    },
    {
      id: 10,
      title: "Digital Cockpit",
      description: "Fully digital cockpit with curved display and intuitive controls designed specifically for the electric driving experience.",
      image: carousel10,
      imageAlt: "Porsche Taycan digital interior"
    }
  ]
};