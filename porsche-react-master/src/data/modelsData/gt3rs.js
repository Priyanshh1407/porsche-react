import hero from "../../assets/gt3rs/hero image.jpeg";
import background from "../../assets/gt3rs/background-3.jpeg";
import performance from "../../assets/gt3rs/performance .png";
import carousel1 from "../../assets/gt3rs/carousel-1.jpeg";
import carousel2 from "../../assets/gt3rs/carousel-2.jpg";
import carousel3 from "../../assets/gt3rs/carousel-3.jpeg";
import carousel4 from "../../assets/gt3rs/carousel-4.jpg";
import carousel5 from "../../assets/gt3rs/carousel-5.jpg";
import carousel6 from "../../assets/gt3rs/carousel-6.jpeg";
import carousel7 from "../../assets/gt3rs/carousel-7.jpg";
import carousel8 from "../../assets/gt3rs/carousel-8.jpg";
import carousel9 from "../../assets/gt3rs/carousel-9.jpg";

export const gt3rs = {
  name: "GT3 RS",
  fullName: "Porsche 911 GT3 RS",
  theme: "gt3rs",
  carouselHeading: "Track-Bred Engineering",
  carouselDescription: "Explore the GT3 RS's motorsport DNA, from aerodynamics to the high-revving engine.",
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
  carouselSlides: [
    {
      id: 1,
      title: "Vehicle Concept",
      description:
        "The road-approved high-performance 911 GT3 RS sports car shows off its full potential on the track. With a high-speed naturally aspirated engine, radical downforce and comprehensive lightweight construction.",
      image: carousel1,
      imageAlt: "Porsche GT3 RS on race track",
    },
    {
      id: 2,
      title: "Aerodynamics",
      description:
        "Porsche Active Aerodynamics (PAA) continuously adjusts the downforce based on all car data. On straights, the Drag Reduction System (DRS) reduces drag.",
      image: carousel2,
      imageAlt: "Porsche GT3 RS aerodynamics",
    },
    {
      id: 3,
      title: "Chassis",
      description:
        "Optimized for use on a track: The chassis with a wide track. Among other things, it helps to ensure high lateral dynamics and improved anti-dive during braking.",
      image: carousel3,
      imageAlt: "Porsche GT3 RS chassis",
    },
    {
      id: 4,
      title: "High-revving naturally aspirated engine",
      description:
        "The 4.0 l six-cylinder flat engine uses 4-valve technology including valve lever and rigid valve drive as well as forged pistons and titanium con rods. Also from the world of motorsport: The dry sump lubrication with separate engine oil tank.",
      image: carousel4,
      imageAlt: "Porsche GT3 RS engine",
    },
    {
      id: 5,
      title: "More Robust",
      description:
        "The sports 7-speed Porsche Doppelkupplung (PDK) is especially robust on the race track, thanks to a modified bleeding system with an adjusted ratio.",
      image: carousel5,
      imageAlt: "Porsche PDK gearbox",
    },
    {
      id: 6,
      title: "PTV Plus",
      description:
        "Porsche Torque Vectoring Plus (PTV Plus) works with an electronically-controlled, fully-variable rear differential lock. For increased traction and improved lateral dynamics as well as enhanced driving stability under load change conditions.",
      image: carousel6,
      imageAlt: "Porsche torque vectoring",
    },
    {
      id: 7,
      title: "Rear-axle Steering",
      description:
        "By steering the rear wheels, the system increases agility when cornering at low speeds. It provides greater driving stability at high speeds or when overtaking on the track.",
      image: carousel7,
      imageAlt: "Porsche rear-axle steering system",
    },
    {
      id: 8,
      title: "Racing-inspired braking system",
      description:
        "High-performance ceramic composite brakes with six-piston calipers provide exceptional stopping power and fade resistance for track use.",
      image: carousel8,
      imageAlt: "Porsche braking system",
    },
    {
      id: 9,
      title: "Hydraulic Lift System",
      description:
        "The optional front-axle hydraulic lift system raises the front of the 911 GT3 RS by 1.6 in. This reduces the risk of grounding on curbs, ramps and parking lot entrances when driving.",
      image: carousel9,
      imageAlt: "Porsche hydraulic lift system",
    },
  ],
};
