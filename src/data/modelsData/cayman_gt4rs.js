import hero from "../../assets/caymangt4/hero.avif";
import background from "../../assets/caymangt4/background.jpg";
import performance from "../../assets/caymangt4/performance.png";
import carousel1 from "../../assets/caymangt4/carousel-1.jpeg";
import carousel2 from "../../assets/caymangt4/carousel-2.jpg";
import carousel3 from "../../assets/caymangt4/carousel-3.jpeg";
import carousel4 from "../../assets/caymangt4/carousel-4.avif";
import carousel5 from "../../assets/caymangt4/carousel-5.jpg";
import carousel6 from "../../assets/caymangt4/carousel-6.jpeg";
import carousel7 from "../../assets/caymangt4/carousel-7.avif";
import carousel8 from "../../assets/caymangt4/carousel-8.avif";
import carousel9 from "../../assets/caymangt4/carousel-9.jpeg";
import carousel10 from "../../assets/caymangt4/carousel-10.avif";
import carousel11 from "../../assets/caymangt4/carousel-11.jpeg";
import carousel12 from "../../assets/caymangt4/carousel-12.avif";
import carousel13 from "../../assets/caymangt4/carousel-13.avif";
import carousel14 from "../../assets/caymangt4/carousel-14.avif";
import carousel15 from "../../assets/caymangt4/carousel-15.jpeg";
import carousel16 from "../../assets/caymangt4/carousel-16.avif";
import carousel17 from "../../assets/caymangt4/carousel-17.jpeg";
import carousel18 from "../../assets/caymangt4/carousel-18.jpeg";

export const cayman_gt4rs = {
  name: "718 Cayman GT4 RS",
  fullName: "Porsche 718 Cayman GT4 RS",
  theme: "caymanGT4",
  carouselHeading: "Mid-Engine Precision",
  carouselDescription: "Explore the GT4 RS's perfect balance, track-tuned chassis, and motorsport-inspired features.",
  hero: {
    title: "Mid-Engine Precision",
    subtitle: "Engineered for the Apex",
    description:
      "The 718 Cayman GT4 RS is the ultimate expression of balance and feedback, with a naturally aspirated flat-six and track-tuned chassis.",
    image: hero,
    fullName: "Porsche 718 Cayman GT4 RS",
  },
  highlights: {
    title: "Precision Meets Passion",
    description:
      "A car built for the purist, the GT4 RS delivers razor-sharp handling, perfect weight distribution, and a soundtrack to match.",
    features: [
      {
        title: "Vehicle Concept",
        subtitle: "GT4 RS",
        description:
          "Mid-engine layout, lightweight construction, and motorsport-derived suspension for ultimate agility.",
      },
      {
        title: "Aerodynamics",
        subtitle: "Track-Optimized",
        description:
          "Aggressive aero package with swan-neck rear wing and large front diffuser for maximum downforce.",
      },
      {
        title: "Naturally Aspirated Engine",
        subtitle: "4.0L Flat-6",
        description:
          "The 4.0L naturally aspirated flat-six revs to 9,000 rpm, delivering 500 hp and a spine-tingling sound.",
      },
    ],
  },
  specs: {
    engine: "4.0L Flat-6",
    power: "500 HP",
    torque: "450 Nm",
    transmission: "7-Speed PDK",
    topSpeed: "315 km/h",
    acceleration: "3.4s (0-100 km/h)",
  },
  detailedSpecs: {
    backgroundImage: background,
    Engine: [
      { label: "Number of Cylinders", value: "6" },
      { label: "Bore", value: "102.0 mm" },
      { label: "Stroke", value: "81.5 mm" },
      { label: "Displacement", value: "3,996 cc" },
      { label: "Max. engine power", value: "500 hp" },
      { label: "Max. engine torque", value: "450 Nm" },
      { label: "Max. engine speed", value: "9,000 rpm" },
      { label: "Engine type", value: "Naturally Aspirated" },
    ],
    Transmission: [
      { label: "Drivetrain", value: "RWD" },
      { label: "Transmission", value: "7-speed PDK gearbox" },
      { label: "Gear ratios", value: "Track optimized" },
      { label: "Launch control", value: "Yes" },
      { label: "Traction control", value: "PSM with ESP" },
    ],
    Dimensions: [
      { label: "Length", value: "4456 mm" },
      { label: "Width", value: "1822 mm" },
      { label: "Height", value: "1267 mm" },
      { label: "Wheelbase", value: "2484 mm" },
      { label: "Kerb Weight", value: "1415 kg" },
    ],
  },
  performanceSpecs: [
    {
      value: "315",
      unit: "KM/H",
      label: "TOP SPEED",
      color: "from-slate-500 to-gray-500",
    },
    {
      value: "3.4",
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
    // Chassis Engineering & GT4 Highlights
    {
      id: 1,
      title: "Aerodynamics",
      description: "Distinctive features: the fixed rear wing with swan-neck connection or the rear diffuser. For high downforce and high traction – and the closest possible proximity to motorsports.",
      image: carousel1,
      imageAlt: "Aerodynamics",
    },
    {
      id: 2,
      title: "Lightweight Construction",
      description: "Lighter. Even lighter. Closer to perfection. That was the principle behind the concept. The result is pure performance with a light unloaded weight of just 1,415 kg.",
      image: carousel2,
      imageAlt: "Lightweight Construction",
    },
    {
      id: 3,
      title: "High-revving naturally aspirated engine.",
      description: "9,000 1/min, outstanding responsiveness and an incredible sound: The 4.0-litre 6-cylinder high-revving naturally aspirated boxer engine was derived from the 911 GT3.",
      image: carousel3,
      imageAlt: "High-revving naturally aspirated engine.",
    },
    {
      id: 4,
      title: "Airbox ",
      description: "Visible engine technology: the airbox has been relocated to the interior and features a re-developed air filter for a robust interior sound and optimum air supply.",
      image: carousel4,
      imageAlt: "Airbox ",
    },
    {
      id: 5,
      title: "Racetrack Chassis",
      description: "A unique combination of racing chassis components optimised for the track. The result is high cornering dynamics, spontaneous steering behaviour and higher cornering speeds.",
      image: carousel5,
      imageAlt: "Racetrack Chassis",
    },
    {
      id: 6,
      title: "Weissach Package.",
      description: "It can be recognised from the ‘Weissach RS’ logo, the characteristic use of carbon-weave finish throughout and the geometric optimisation of the upper side air intakes for even better air supply.",
      image: carousel6,
      imageAlt: "Weissach Package.",
    },
    {
      id: 7,
      title: "Cockpit",
      description: "The centrepiece is the 718 RS sports steering wheel with Yellow centre top marking and Black gearshift paddles with Yellow markings. They enable crisp, short gear changes, just like in motorsports.",
      image: carousel7,
      imageAlt: "Cockpit",
    },
    // Engine & Transmission Features
    {
      id: 8,
      title: "4.0 litre six-cylinder naturally aspirated boxer engine.",
      description: "Derived from the 911 GT3 R and 911 RSR, the 4.0-litre flat-six engine produces 368 kW (500 PS) at 8,400 rpm and 450 Nm at 6,750 rpm. It is the most powerful engine in the 718 model range, revving up to 9,000 rpm.",
      image: carousel8,
      imageAlt: "4.0 Litre Six-Cylinder Engine",
    },
    {
      id: 9,
      title: "Engine Technology Derived from Motorsports",
      description: "The high-revving boxer engine features a rigid valve drive with rocker arms, VarioCam technology, and individual throttle bodies for each cylinder, ensuring robust performance and immediate throttle response.",
      image: carousel9,
      imageAlt: "Engine Technology from Motorsports",
    },
    {
      id: 10,
      title: "From irrational to perfect in a hundredth of a second.",
      description: "The shifts of the performance-orientated 7-speed Porsche Doppelkupplung (PDK) are fast and emotive. Even the 7th gear has a short, sporty response. The mechanical locking differential ensures optimal power transmission. ",
      image: carousel10,
      imageAlt: "From irrational to perfect in a hundredth of a second.",
    },
    {
      id: 11,
      title: "Porsche Torque Vectoring (PTV).",
      description: "The PTV improves the driving dynamics. The integrated mechanical rear differential lock enables higher traction and significantly improved lateral dynamics and driving stability during load changes in bends and when changing lanes.",
      image: carousel11,
      imageAlt: "Porsche Torque Vectoring (PTV).",
    },
    {
      id: 12,
      title: "Chassis with GT technology.",
      description: "Lightweight suspension strut axles, taut springs and helper springs in combination with specific wheel mounts ensure high traction and stability. Ball joints allow particularly precise wheel guidance.",
      image: carousel12,
      imageAlt: "Chassis with GT technology.",
    },
    {
      id: 13,
      title: "Personalised setup.",
      description: "The ride height, camber, toe and anti-roll bar can be adjusted for use on the race track. The result is a race track chassis for high cornering dynamics, spontaneous steering behaviour and higher cornering speeds.",
      image: carousel13,
      imageAlt: "Personalised setup.",
    },
    {
      id: 14,
      title: "Porsche Active Suspension Management (PASM, –30 mm).",
      description: "The electronic adjustment of the damping control system actively and continuously adjusts the damping force on each wheel, based on current road conditions and driving style. The PASM has two settings: sporty-comfortable and sporty-firm.",
      image: carousel14,
      imageAlt: "Porsche Active Suspension Management (PASM, –30 mm).",
    },
    {
      id: 15,
      title: "Porsche Stability Management (PSM).",
      description: "PSM is an automatic control system for maintaining stability at the limits of dynamic driving performance. The systems can be switched off completely in two stages.",
      image: carousel15,
      imageAlt: "Porsche Stability Management (PSM).",
    },
    {
      id: 16,
      title: "Lift system on the front axle.",
      description: "30mm may not sound like much, but it makes the difference at speeds of up to around 60km/h with the increased ground clearance.",
      image: carousel16,
      imageAlt: "Lift system on the front axle.",
    },
    {
      id: 17,
      title: "Deceleration in RS style.",
      description: "For fast and safe braking to a standstill: six-piston front and four-piston rear aluminium monobloc fixed calliper brakes with Red brake callipers and large Grey cast aluminium composite brake discs. The efficient brake ventilation and cooling system is specially designed for high loads.",
      image: carousel17,
      imageAlt: "Deceleration in RS style.",
    },
    {
      id: 18,
      title: "PCCB.",
      description: "The optional Porsche Ceramic Composite Brake (PCCB) with brake callipers in Yellow or optionally in Black enables high braking performance and consistent braking pressure. The brake discs weigh approximately 50% less than cast iron brake discs of comparable design and dimensions.",
      image: carousel18,
      imageAlt: "PCCB.",
    },
  ],
};
