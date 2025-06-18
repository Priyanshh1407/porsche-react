export const cayenne = {
  name: "Cayenne",
  fullName: "Porsche Cayenne Turbo",
  theme: "cayenne",
  hero: {
    title: "The All-New",
    subtitle: "Adventure Redefined",
    description: "Commanding presence meets uncompromising performance",
    image: "/assets/images/cayenne-hero.jpg"
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
  carouselSlides: [
    {
      id: 1,
      title: "SUV Performance",
      description: "The Cayenne Turbo combines the comfort of a luxury SUV with the heart of a sports car, delivering exceptional performance on any terrain.",
      image: "/assets/images/cayenne-performance.jpg",
      imageAlt: "Porsche Cayenne Turbo in action"
    },
    {
      id: 2,
      title: "Terrain Management",
      description: "Advanced terrain management system with multiple driving modes ensures confidence in any environment, from city streets to off-road adventures.",
      image: "/assets/images/cayenne-terrain.jpg",
      imageAlt: "Porsche Cayenne off-road capabilities"
    },
    {
      id: 3,
      title: "Air Suspension",
      description: "Porsche Active Suspension Management (PASM) with air suspension adapts to any road condition for optimal comfort and control.",
      image: "/assets/images/cayenne-suspension.jpg",
      imageAlt: "Porsche Cayenne air suspension"
    },
    {
      id: 4,
      title: "Twin-Turbo V8 Engine",
      description: "The powerful 4.0-liter twin-turbocharged V8 engine delivers massive torque and exceptional performance across all driving conditions.",
      image: "/assets/images/cayenne-engine.jpg",
      imageAlt: "Porsche Cayenne V8 engine"
    },
    {
      id: 5,
      title: "8-Speed Tiptronic S",
      description: "The sophisticated 8-speed Tiptronic S transmission provides smooth shifts and optimal gear ratios for both comfort and performance.",
      image: "/assets/images/cayenne-transmission.jpg",
      imageAlt: "Porsche Tiptronic S transmission"
    },
    {
      id: 6,
      title: "All-Wheel Drive",
      description: "Porsche Traction Management (PTM) all-wheel drive system with active transfer case ensures optimal power distribution in all conditions.",
      image: "/assets/images/cayenne-awd.jpg",
      imageAlt: "Porsche Cayenne AWD system"
    },
    {
      id: 7,
      title: "Adaptive Dynamics",
      description: "Dynamic chassis systems including Porsche Dynamic Chassis Control (PDCC) provide exceptional handling and stability.",
      image: "/assets/images/cayenne-dynamics.jpg",
      imageAlt: "Porsche Cayenne dynamic systems"
    },
    {
      id: 8,
      title: "Braking Performance",
      description: "High-performance braking system with optional Porsche Ceramic Composite Brakes (PCCB) ensures exceptional stopping power.",
      image: "/assets/images/cayenne-brakes.jpg",
      imageAlt: "Porsche Cayenne braking system"
    },
    {
      id: 9,
      title: "Luxury Interior",
      description: "Spacious and luxurious interior with premium materials, advanced technology, and versatile seating configurations.",
      image: "/assets/images/cayenne-interior.jpg",
      imageAlt: "Porsche Cayenne interior"
    }
  ]
};