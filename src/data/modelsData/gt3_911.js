export const gt3_911 = {
  name: "911 Turbo",
  fullName: "Porsche 911 Turbo S",
  theme: "911turbo",
  hero: {
    title: "The All-New",
    subtitle: "Turbocharged Excellence",
    description: "Where luxury meets uncompromising performance",
    image: "/assets/images/911turbo-hero.jpg"
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
  carouselSlides: [
    {
      id: 1,
      title: "Twin-Turbo Excellence",
      description: "The 911 Turbo S combines everyday usability with track-ready performance, featuring advanced turbocharging technology and all-wheel drive.",
      image: "/assets/images/911turbo-concept.jpg",
      imageAlt: "Porsche 911 Turbo S exterior"
    },
    {
      id: 2,
      title: "Active Aerodynamics",
      description: "Adaptive aerodynamics system automatically adjusts to optimize downforce and reduce drag for maximum performance in all conditions.",
      image: "/assets/images/911turbo-aero.jpg",
      imageAlt: "Porsche 911 Turbo S aerodynamics"
    },
    {
      id: 3,
      title: "All-Wheel Drive System",
      description: "Porsche Traction Management (PTM) ensures optimal power distribution and traction in all weather conditions and driving scenarios.",
      image: "/assets/images/911turbo-awd.jpg",
      imageAlt: "Porsche PTM system"
    },
    {
      id: 4,
      title: "Twin-Turbocharged Engine",
      description: "The 3.8-liter twin-turbocharged flat-six engine delivers exceptional power with remarkable efficiency and instantaneous response.",
      image: "/assets/images/911turbo-engine.jpg",
      imageAlt: "Porsche 911 Turbo S engine"
    },
    {
      id: 5,
      title: "8-Speed PDK",
      description: "The advanced 8-speed PDK transmission provides lightning-fast shifts and optimal gear ratios for both comfort and performance.",
      image: "/assets/images/911turbo-transmission.jpg",
      imageAlt: "Porsche 8-speed PDK"
    },
    {
      id: 6,
      title: "Sport Chrono Package",
      description: "Integrated Sport Chrono Package with dynamic transmission mounts and performance-oriented driving modes for enhanced dynamics.",
      image: "/assets/images/911turbo-chrono.jpg",
      imageAlt: "Porsche Sport Chrono"
    },
    {
      id: 7,
      title: "Advanced Suspension",
      description: "Porsche Active Suspension Management (PASM) with electronic damper control adapts to road conditions and driving style.",
      image: "/assets/images/911turbo-suspension.jpg",
      imageAlt: "Porsche PASM suspension"
    },
    {
      id: 8,
      title: "Carbon Ceramic Brakes",
      description: "Optional Porsche Ceramic Composite Brake (PCCB) system provides exceptional stopping power with reduced weight and improved fade resistance.",
      image: "/assets/images/911turbo-brakes.jpg",
      imageAlt: "Porsche ceramic brakes"
    },
    {
      id: 9,
      title: "Luxury Interior",
      description: "Premium interior with sport seats, advanced infotainment, and high-quality materials throughout for the ultimate driving experience.",
      image: "/assets/images/911turbo-interior.jpg",
      imageAlt: "Porsche 911 Turbo S interior"
    }
  ]
};