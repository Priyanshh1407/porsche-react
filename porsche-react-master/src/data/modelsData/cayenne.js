import hero from "../../assets/cayenne/hero.jpg";
import perforamce from "../../assets/cayenne/performance.avif";
import background from "../../assets/cayenne/background.jpeg";
import carousel1 from "../../assets/cayenne/carousel-1.jpg";
import carousel2 from "../../assets/cayenne/carousel-2.jpg";
import carousel3 from "../../assets/cayenne/carousel-3.avif";
import carousel4 from "../../assets/cayenne/carousel-4.avif";
import carousel5 from "../../assets/cayenne/carousel-5.avif";
import carousel6 from "../../assets/cayenne/carousel-6.jpg";
import carousel7 from "../../assets/cayenne/carousel-7.avif";
import carousel8 from "../../assets/cayenne/carousel-8.avif";
import carousel9 from "../../assets/cayenne/carousel-9.jpg";

export const cayenne = {
  name: "Cayenne",
  fullName: "Porsche Cayenne Turbo",
  theme: "cayenne",
  carouselHeading: "Luxury SUV, Sports Car Soul",
  carouselDescription: "See how the Cayenne blends off-road capability, luxury, and Porsche performance.",
  hero: {
    title: "The All-New",
    subtitle: "Adventure Redefined",
    description: "Commanding presence meets uncompromising performance",
    image: hero
  },
  highlights: {
    title: "Conquer every\nTerrain",
    description: "The perfect blend of luxury SUV comfort and sports car performance, engineered to excel both on and off the road.",
    features: [
      {
        title: "SUV Performance",
        subtitle: "Turbo V8",
        description: "The Cayenne Turbo combines the comfort of a luxury SUV with the heart of a sports car, delivering exceptional performance."
      },
      {
        title: "Air Suspension",
        icon: "mountain",
        description: "Porsche Active Suspension Management (PASM) with air suspension adapts to any road condition for optimal comfort and control."
      },
      {
        title: "Terrain Management",
        image: "/assets/images/cayenne-terrain.png",
        description: "Advanced terrain management system with multiple driving modes ensures confidence in any environment."
      }
    ]
  },
  specs: {
    engine: "4.0L Twin-Turbo V8",
    power: "541 HP",
    torque: "770 Nm",
    transmission: "8-Speed Tiptronic S",
    topSpeed: "286 km/h",
    acceleration: "3.9s (0-100 km/h)"
  },
  detailedSpecs: {
    backgroundImage: background,
    Engine: [
      { label: 'Number of Cylinders', value: '8' },
      { label: 'Bore', value: '86.0 mm' },
      { label: 'Stroke', value: '86.0 mm' },
      { label: 'Displacement', value: '3,996 cc' },
      { label: 'Max. engine power', value: '541 hp' },
      { label: 'Max. engine torque', value: '770 Nm' },
      { label: 'Max. engine speed', value: '6,800 rpm' },
      { label: 'Engine type', value: 'Twin-Turbocharged V8' },
    ],
    Transmission: [
      { label: 'Drivetrain', value: 'AWD' },
      { label: 'Transmission', value: '8-speed Tiptronic S' },
      { label: 'Gear ratios', value: 'SUV optimized' },
      { label: 'Launch control', value: 'Yes' },
      { label: 'Traction control', value: 'PTM with Terrain Modes' },
    ],
    Dimensions: [
      { label: 'Length', value: '4918 mm' },
      { label: 'Width', value: '1983 mm' },
      { label: 'Height', value: '1696 mm' },
      { label: 'Wheelbase', value: '2895 mm' },
      { label: 'Kerb Weight', value: '2200 kg' },
    ]
  },
  performanceSpecs: [
    { value: "177", unit: "MPH", label: "TOP SPEED", color: "from-green-500 to-emerald-500" },
    { value: "3.9", unit: "SEC", label: "0-60 MPH", color: "from-yellow-400 to-amber-500" },
    { value: "8", unit: "SPEED", label: "TIPTRONIC S", color: "from-blue-400 to-cyan-500" }
  ],
  performanceImage: perforamce,
  carouselSlides: [
    {
      id: 1,
      title: "SUV Performance",
      description: "The Cayenne Turbo combines the comfort of a luxury SUV with the heart of a sports car, delivering exceptional performance on any terrain.",
      image: carousel1,
      imageAlt: "Porsche Cayenne Turbo in action"
    },
    {
      id: 2,
      title: "Terrain Management",
      description: "Advanced terrain management system with multiple driving modes ensures confidence in any environment, from city streets to off-road adventures.",
      image: carousel2,
      imageAlt: "Porsche Cayenne off-road capabilities"
    },
    {
      id: 3,
      title: "Air Suspension",
      description: "Porsche Active Suspension Management (PASM) with air suspension adapts to any road condition for optimal comfort and control.",
      image: carousel3,
      imageAlt: "Porsche Cayenne air suspension"
    },
    {
      id: 4,
      title: "Twin-Turbo V8 Engine",
      description: "The powerful 4.0-liter twin-turbocharged V8 engine delivers massive torque and exceptional performance across all driving conditions.",
      image: carousel4,
      imageAlt: "Porsche Cayenne V8 engine"
    },
    {
      id: 5,
      title: "App Center",
      description: "The App Center offers an interactive experience with the ability to download your favourite app  from categories such as music and video streaming, gaming and news.",
      image: carousel5,
      imageAlt: "Porsche Cayenne App Center"
    },
    {
      id: 6,
      title: "All-Wheel Drive",
      description: "Porsche Traction Management (PTM) all-wheel drive system with active transfer case ensures optimal power distribution in all conditions.",
      image: carousel6,
      imageAlt: "Porsche Cayenne AWD system"
    },
    {
      id: 7,
      title: "Adaptive Dynamics",
      description: "Dynamic chassis systems including Porsche Dynamic Chassis Control (PDCC) provide exceptional handling and stability.",
      image: carousel7,
      imageAlt: "Porsche Cayenne dynamic systems"
    },
    {
      id: 8,
      title: "Braking Performance",
      description: "High-performance braking system with optional Porsche Ceramic Composite Brakes (PCCB) ensures exceptional stopping power.",
      image: carousel8,
      imageAlt: "Porsche Cayenne braking system"
    },
    {
      id: 9,
      title: "Luxury Interior",
      description: "Spacious and luxurious interior with premium materials, advanced technology, and versatile seating configurations.",
      image: carousel9,
      imageAlt: "Porsche Cayenne interior"
    }
  ]
};