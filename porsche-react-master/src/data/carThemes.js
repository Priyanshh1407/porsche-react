export const carThemes = {
  home: {
    name: "Porsche Home",
    primary: "red-500",
    secondary: "red-600",
    accent: "red-400",
    gradient: "from-red-600 to-red-800",
    text: "text-red-500",
    textSecondary: "text-red-400",
    textAccent: "text-red-300",
    bg: "bg-red-500",
    bgSecondary: "bg-red-600",
    border: "border-red-500",
    hover: "hover:text-red-400",
    // Navbar specific
    navBg: "bg-black/90 backdrop-blur-md border-red-500/30",
    navText: "text-white",
    navHover: "hover:text-red-500",
    buttonHover: "hover:bg-red-500",
    navActive: "text-red-500 border-2 border-red-500",
    // Footer specific
    footerBg: "bg-gray-900 border-red-500/20",
    footerText: "text-gray-300",
    footerHeading: "text-red-500",
    footerHover: "hover:text-red-400"
  },
  // 🟡 911 GT3 RS - Track Focus (Hero Yellow/Orange)
  gt3rs: {
    name: "GT3 RS",
    environment: "Circuit Thunder",
    primary: "yellow-400",
    secondary: "orange-500",
    accent: "yellow-200",
    gradient: "from-yellow-400 to-orange-500",
    text: "text-yellow-400",
    textSecondary: "text-yellow-200",
    textAccent: "text-yellow-300",
    bg: "bg-yellow-400",
    bgSecondary: "bg-yellow-500",
    bgTertiary: "bg-slate-900",
    bgPattern: "bg-gradient-to-br from-slate-900 via-yellow-950 to-orange-950",
    border: "border-yellow-400",
    borderSecondary: "border-yellow-500/50",
    hover: "hover:text-yellow-300",
    hoverBg: "hover:bg-yellow-400/20",

    // Navigation - Racing Cockpit
    navBg: "bg-black/90 backdrop-blur-md border-yellow-400/30",
    navText: "text-white",
    navHover: "hover:text-yellow-400",
    navActive: "text-yellow-400 border-2 border-yellow-400",

    // Footer - Pit Lane
    footerBg: "bg-gray-900 border-yellow-400/20",
    footerText: "text-gray-300",
    footerHeading: "text-yellow-400",
    footerHover: "hover:text-yellow-300",

    // Cards - Aerodynamic Panels
    cardBg: "bg-slate-900/70 backdrop-blur-sm",
    cardBorder: "border-yellow-400/40",

    // Buttons - Race Controls
    buttonPrimary: "bg-yellow-400 hover:bg-yellow-500 text-black",
    buttonSecondary: "bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-yellow-400",
    buttonOutline: "border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black",
    buttonHover: "hover:bg-yellow-500",

    // Racing Status
    statusActive: "bg-yellow-400",
    statusInactive: "bg-slate-600",
    statusWarning: "bg-orange-500",

    // Track Effects
    glowEffect: "shadow-yellow-400/60",
    textGlow: "text-shadow-yellow",

    // Track Elements
    track: {
      straightaway: "text-yellow-400",
      corner: "text-orange-500",
      braking: "text-red-600",
      acceleration: "text-yellow-300",
      pitlane: "text-slate-400"
    }
  },

  // 🔴 911 GT2 RS - Raw Power + Danger (Volcano/Lava)
  gt2rs: {
    name: "GT2 RS",
    environment: "Volcanic Fury",
    primary: "red-600",
    secondary: "red-700",
    accent: "red-400",
    gradient: "from-red-600 via-orange-700 to-red-800",
    text: "text-red-400",
    textSecondary: "text-red-200",
    textAccent: "text-red-300",
    bg: "bg-red-600",
    bgSecondary: "bg-red-700",
    bgTertiary: "bg-stone-900",
    bgPattern: "bg-gradient-to-br from-stone-900 via-red-950 to-orange-950",
    border: "border-red-600",
    borderSecondary: "border-red-700/50",
    hover: "hover:text-red-300",
    hoverBg: "hover:bg-red-600/20",

    // Navigation - Molten Steel
    navBg: "bg-stone-900/95 backdrop-blur-md border-red-600/40",
    navText: "text-stone-100",
    navHover: "hover:text-red-400",
    navActive: "text-red-400 border-b-2 border-red-600",

    // Footer - Volcanic Rock
    footerBg: "bg-stone-900 border-red-600/30",
    footerText: "text-stone-300",
    footerHeading: "text-red-400",
    footerHover: "hover:text-red-300",

    // Cards - Lava Flow
    cardBg: "bg-stone-900/80 backdrop-blur-sm",
    cardBorder: "border-red-600/40",

    // Buttons - Danger Warnings
    buttonPrimary: "bg-red-600 hover:bg-red-700 text-white",
    buttonSecondary: "bg-stone-800 hover:bg-stone-700 text-red-400 border border-red-600",
    buttonOutline: "border-red-600 text-red-400 hover:bg-red-600 hover:text-white",

    // Danger Status
    statusActive: "bg-red-600",
    statusInactive: "bg-stone-700",
    statusWarning: "bg-orange-600",

    // Volcanic Effects
    glowEffect: "shadow-red-600/70",
    textGlow: "text-shadow-red",

    // Power Elements
    power: {
      turbo: "text-red-400",
      heat: "text-orange-500",
      danger: "text-red-600",
      raw: "text-red-300",
      molten: "text-orange-600"
    }
  },

  // 🟢 911 Turbo S - Everyday Usability + Speed (Urban Jungle/Neon City)
  turboS: {
    name: "Turbo S",
    environment: "Neon Metropolis",
    primary: "gray-300",
    secondary: "gray-400",
    accent: "gray-200",
    gradient: "from-gray-300 via-gray-400 to-gray-500",
    text: "text-gray-300",
    textSecondary: "text-gray-200",
    textAccent: "text-gray-100",
    bg: "bg-gray-300",
    bgSecondary: "bg-gray-400",
    bgTertiary: "bg-gray-900",
    bgPattern: "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700",
    border: "border-gray-300",
    borderSecondary: "border-gray-400/50",
    hover: "hover:text-gray-200",
    hoverBg: "hover:bg-gray-300/20",

    // Navigation - Sleek Platinum
    navBg: "bg-gray-900/95 backdrop-blur-md border-gray-300/40",
    navText: "text-gray-100",
    navHover: "hover:text-gray-300",
    navActive: "text-gray-300 border-b-2 border-gray-400",

    // Footer - Metallic Finish
    footerBg: "bg-gray-900 border-gray-300/30",
    footerText: "text-gray-400",
    footerHeading: "text-gray-300",
    footerHover: "hover:text-gray-200",

    // Cards - Brushed Metal
    cardBg: "bg-gray-800/80 backdrop-blur-md",
    cardBorder: "border-gray-300/30",

    // Buttons - Premium Silver
    buttonPrimary: "bg-gray-300 hover:bg-gray-200 text-gray-900",
    buttonSecondary: "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-400",
    buttonOutline: "border-gray-300 text-gray-300 hover:bg-gray-300 hover:text-gray-900",

    // Platinum Status
    statusActive: "bg-gray-300",
    statusInactive: "bg-gray-600",
    statusWarning: "bg-yellow-400",

    // Metallic Effects
    glowEffect: "shadow-gray-300/50",
    textGlow: "text-shadow-gray",

    // Luxury Elements
    luxury: {
        chrome: "text-gray-200",
        platinum: "text-gray-300",
        steel: "text-gray-400",
        pearl: "text-gray-100",
        carbon: "text-gray-800"
    }
  },

  // 🟡 918 Spyder - Hybrid Hypercar Tech (Electric Storm/Lightning)
  spyder918: {
    name: "918 Spyder",
    environment: "Electric Storm",
    primary: "orange-400",
    secondary: "orange-500",
    accent: "orange-300",
    gradient: "from-orange-400 via-amber-500 to-red-500",
    text: "text-orange-300",
    textSecondary: "text-orange-200",
    textAccent: "text-amber-300",
    bg: "bg-orange-400",
    bgSecondary: "bg-orange-500",
    bgTertiary: "bg-stone-900",
    bgPattern: "bg-gradient-to-br from-stone-950 via-amber-950/80 to-orange-900/60",
    border: "border-orange-400",
    borderSecondary: "border-orange-500/50",
    hover: "hover:text-orange-200",
    hoverBg: "hover:bg-orange-400/20",

    // Navigation - Minimalist Chrome
    navBg: "bg-stone-900/95 backdrop-blur-md border-orange-400/30",
    navText: "text-stone-100",
    navHover: "hover:text-orange-300",
    navActive: "text-orange-400 border-b-2 border-orange-400",

    // Footer - Concrete Foundation
    footerBg: "bg-stone-900 border-orange-400/20",
    footerText: "text-stone-300",
    footerHeading: "text-orange-400",
    footerHover: "hover:text-orange-300",

    // Cards - Glass Panels
    cardBg: "bg-stone-900/60 backdrop-blur-xl",
    cardBorder: "border-orange-400/30",

    // Buttons - Racing Heritage
    buttonPrimary: "bg-orange-400 hover:bg-orange-500 text-stone-900",
    buttonSecondary: "bg-stone-800 hover:bg-stone-700 text-orange-400 border border-orange-400",
    buttonOutline: "border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-stone-900",

    // Performance Status
    statusActive: "bg-orange-400",
    statusInactive: "bg-stone-600",
    statusWarning: "bg-red-500",

    // Warm Glow Effects
    glowEffect: "shadow-orange-400/50",
    textGlow: "text-shadow-orange",

    // Automotive Elements
    automotive: {
      engine: "text-red-400",
      carbon: "text-stone-400",
      chrome: "text-slate-300",
      leather: "text-amber-600",
      ceramic: "text-orange-300"
    },

    // Light & Shadow
    lighting: {
      warm: "text-amber-300",
      cool: "text-blue-200",
      shadow: "text-stone-600",
      highlight: "text-orange-200",
      reflection: "text-slate-200"
    },

    // Material Textures
    materials: {
      metal: "bg-gradient-to-r from-stone-700 to-stone-800",
      glass: "bg-stone-900/40 backdrop-blur-lg",
      carbon: "bg-gradient-to-r from-stone-900 to-stone-800",
      ceramic: "bg-gradient-to-r from-orange-950 to-stone-900"
    }
  },

  // 🔵 Carrera GT - Iconic V10 Legacy (Crystal Ice/Diamond)
  carreraGT: {
    name: "Carrera GT",
    environment: "Racing Heritage",
    primary: "amber-500",
    secondary: "stone-600",
    accent: "yellow-400",
    gradient: "from-amber-500 via-yellow-600 to-orange-600",
    text: "text-amber-400",
    textSecondary: "text-stone-300",
    textAccent: "text-yellow-300",
    bg: "bg-amber-500",
    bgSecondary: "bg-stone-600",
    bgTertiary: "bg-stone-800",
    bgPattern: "bg-gradient-to-br from-stone-700 via-stone-600 to-stone-500",
    border: "border-amber-500",
    borderSecondary: "border-stone-600/50",
    hover: "hover:text-amber-300",
    hoverBg: "hover:bg-amber-500/20",

    // Navigation - Desert Horizon
    navBg: "bg-stone-900/90 backdrop-blur-xl border-amber-500/30",
    navText: "text-stone-200",
    navHover: "hover:text-amber-400",
    navActive: "text-amber-400 border-b-2 border-amber-500",

    // Footer - Mountain Silhouette
    footerBg: "bg-stone-900 border-stone-600/30",
    footerText: "text-stone-400",
    footerHeading: "text-amber-400",
    footerHover: "hover:text-amber-300",

    // Cards - Desert Glass
    cardBg: "bg-stone-800/60 backdrop-blur-lg",
    cardBorder: "border-amber-500/20",

    // Buttons - Southwestern Precision
    buttonPrimary: "bg-amber-500 hover:bg-amber-600 text-white",
    buttonSecondary: "bg-stone-800 hover:bg-stone-700 text-amber-400 border border-amber-500",
    buttonOutline: "border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-white",

    // Performance Status
    statusActive: "bg-amber-500",
    statusInactive: "bg-stone-600",
    statusWarning: "bg-yellow-500",

    // Desert Atmosphere Effects
    glowEffect: "shadow-amber-500/40",
    textGlow: "text-shadow-amber",

    // Legacy Elements - Inspired by the Yellow Carrera GT
    legacy: {
      v10: "text-yellow-400",
      manual: "text-amber-400",
      carbon: "text-stone-400",
      crystal: "text-yellow-300",
      heritage: "text-amber-300",
      showroom: "text-yellow-500",
      spotlight: "text-amber-200",
      precision: "text-yellow-600"
    }

  },

  // ⚡ Taycan - Electric Powertrain (Digital Matrix/Cyber)
  taycan: {
    name: "Taycan",
    environment: "Digital Matrix",
    primary: "cyan-500",
    secondary: "cyan-600",
    accent: "cyan-400",
    gradient: "from-cyan-500 via-blue-600 to-cyan-700",
    text: "text-cyan-400",
    textSecondary: "text-cyan-200",
    textAccent: "text-cyan-300",
    bg: "bg-cyan-500",
    bgSecondary: "bg-cyan-600",
    bgTertiary: "bg-gray-900",
    bgPattern: "bg-gradient-to-br from-gray-900 via-cyan-950 to-blue-950",
    border: "border-cyan-500",
    borderSecondary: "border-cyan-600/50",
    hover: "hover:text-cyan-300",
    hoverBg: "hover:bg-cyan-500/20",

    // Navigation - Digital Interface
    navBg: "bg-gray-900/95 backdrop-blur-md border-cyan-500/40",
    navText: "text-gray-100",
    navHover: "hover:text-cyan-400",
    navActive: "text-cyan-400 border-b-2 border-cyan-500",

    // Footer - Code Stream
    footerBg: "bg-gray-900 border-cyan-500/30",
    footerText: "text-gray-300",
    footerHeading: "text-cyan-400",
    footerHover: "hover:text-cyan-300",

    // Cards - Data Nodes
    cardBg: "bg-gray-900/60 backdrop-blur-sm",
    cardBorder: "border-cyan-500/30",

    // Buttons - System Commands
    buttonPrimary: "bg-cyan-500 hover:bg-cyan-600 text-white",
    buttonSecondary: "bg-gray-800 hover:bg-gray-700 text-cyan-400 border border-cyan-500",
    buttonOutline: "border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white",

    // Electric Status
    statusActive: "bg-cyan-500",
    statusInactive: "bg-gray-600",
    statusWarning: "bg-blue-500",

    // Digital Effects
    glowEffect: "shadow-cyan-500/50",
    textGlow: "text-shadow-cyan",

    // Electric Elements
    electric: {
      battery: "text-cyan-400",
      charging: "text-green-400",
      motor: "text-cyan-300",
      digital: "text-blue-400",
      matrix: "text-cyan-200"
    }
  },

  // 💺 Panamera - Luxury Grand Touring (Royal Palace/Gold)
  panamera: {
    name: "Panamera",
    environment: "Royal Palace",
    primary: "amber-600",
    secondary: "amber-700",
    accent: "amber-500",
    gradient: "from-amber-600 via-yellow-600 to-amber-800",
    text: "text-amber-400",
    textSecondary: "text-amber-200",
    textAccent: "text-amber-300",
    bg: "bg-amber-600",
    bgSecondary: "bg-amber-700",
    bgTertiary: "bg-stone-900",
    bgPattern: "bg-gradient-to-br from-stone-900 via-amber-950 to-yellow-950",
    border: "border-amber-600",
    borderSecondary: "border-amber-700/50",
    hover: "hover:text-amber-300",
    hoverBg: "hover:bg-amber-600/20",

    // Navigation - Gilded Frame
    navBg: "bg-stone-900/95 backdrop-blur-md border-amber-600/40",
    navText: "text-stone-100",
    navHover: "hover:text-amber-400",
    navActive: "text-amber-400 border-b-2 border-amber-600",

    // Footer - Marble Base
    footerBg: "bg-stone-900 border-amber-600/30",
    footerText: "text-stone-300",
    footerHeading: "text-amber-400",
    footerHover: "hover:text-amber-300",

    // Cards - Luxury Panels
    cardBg: "bg-stone-900/70 backdrop-blur-sm",
    cardBorder: "border-amber-600/40",

    // Buttons - Premium Controls
    buttonPrimary: "bg-amber-600 hover:bg-amber-700 text-white",
    buttonSecondary: "bg-stone-800 hover:bg-stone-700 text-amber-400 border border-amber-600",
    buttonOutline: "border-amber-600 text-amber-400 hover:bg-amber-600 hover:text-white",

    // Luxury Status
    statusActive: "bg-amber-600",
    statusInactive: "bg-stone-600",
    statusWarning: "bg-yellow-600",

    // Golden Effects
    glowEffect: "shadow-amber-600/50",
    textGlow: "text-shadow-amber",

    // Luxury Elements
    luxury: {
      leather: "text-amber-600",
      massage: "text-amber-400",
      comfort: "text-yellow-400",
      royal: "text-amber-300",
      grand: "text-amber-500"
    }
  },

  // 🟫 Cayenne - Off-road & Power SUV (Already provided)
  cayenne: {
    name: "Cayenne",
    environment: "Rugged Terrain",
    primary: "emerald-500",
    secondary: "emerald-700",
    accent: "emerald-300",
    gradient: "from-emerald-500 via-teal-600 to-emerald-700",
    text: "text-emerald-400",
    textSecondary: "text-emerald-200",
    textAccent: "text-emerald-300",
    bg: "bg-emerald-500",
    bgSecondary: "bg-emerald-600",
    bgTertiary: "bg-stone-800",
    bgPattern: "bg-gradient-to-br from-slate-900 via-emerald-950 to-stone-900",
    bgUnified: "bg-gradient-to-br from-slate-900 via-emerald-950 to-stone-900",
    border: "border-emerald-500",
    borderSecondary: "border-emerald-600/50",
    hover: "hover:text-emerald-300",
    hoverBg: "hover:bg-emerald-500/20",

    // Navigation - Rugged and Bold
    navBg: "bg-stone-900/95 backdrop-blur-md border-emerald-500/30",
    navText: "text-stone-100",
    navHover: "hover:text-emerald-400",
    navActive: "text-emerald-400 border-b-2 border-emerald-500",

    // Footer - Earthy and Strong
    footerBg: "bg-black/10 border-t border-emerald-500/25",
    footerText: "text-stone-300",
    footerHeading: "text-emerald-400",
    footerHover: "hover:text-emerald-300",


    // Cards and Components - Rugged Design
    cardBg: "bg-stone-900/60 backdrop-blur-sm",
    cardBorder: "border-emerald-500/30",

    // Buttons - Adventure Ready
    buttonPrimary: "bg-emerald-500 hover:bg-emerald-600 text-white",
    buttonSecondary: "bg-stone-800 hover:bg-stone-700 text-emerald-400 border border-emerald-500",
    buttonOutline: "border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white",

    // Status indicators for off-road capabilities
    statusActive: "bg-emerald-500",
    statusInactive: "bg-stone-600",
    statusWarning: "bg-amber-500",

    // Special effects for terrain/adventure theme
    glowEffect: "shadow-emerald-500/50",
    textGlow: "text-shadow-emerald",

    // Terrain-specific colors
    terrain: {
      rock: "text-stone-400",
      mud: "text-amber-600",
      sand: "text-yellow-600",
      snow: "text-blue-300",
      forest: "text-emerald-400"
    }
  },

  // 🏙️ Macan GTS - Urban Sportiness (Urban Twilight/Purple Neon)
  macanGTS: {
    name: "Macan GTS",
    environment: "Urban Twilight",
    primary: "purple-500",
    secondary: "purple-600",
    accent: "purple-400",
    gradient: "from-purple-500 via-pink-600 to-purple-700",
    text: "text-purple-400",
    textSecondary: "text-purple-200",
    textAccent: "text-purple-300",
    bg: "bg-purple-500",
    bgSecondary: "bg-purple-600",
    bgTertiary: "bg-gray-900",
    bgPattern: "bg-gradient-to-br from-gray-900 via-purple-950 to-pink-950",
    border: "border-purple-500",
    borderSecondary: "border-purple-600/50",
    hover: "hover:text-purple-300",
    hoverBg: "hover:bg-purple-500/20",

    // Navigation - City Vibes
    navBg: "bg-gray-900/95 backdrop-blur-md border-purple-500/40",
    navText: "text-gray-100",
    navHover: "hover:text-purple-400",
    navActive: "text-purple-400 border-b-2 border-purple-500",

    // Footer - Night Scene
    footerBg: "bg-gray-900 border-purple-500/30",
    footerText: "text-gray-300",
    footerHeading: "text-purple-400",
    footerHover: "hover:text-purple-300",

    // Cards - Urban Panels
    cardBg: "bg-gray-900/60 backdrop-blur-md",
    cardBorder: "border-purple-500/30",

    // Buttons - Street Style
    buttonPrimary: "bg-purple-500 hover:bg-purple-600 text-white",
    buttonSecondary: "bg-gray-800 hover:bg-gray-700 text-purple-400 border border-purple-500",
    buttonOutline: "border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white",

    // Urban Status
    statusActive: "bg-purple-500",
    statusInactive: "bg-gray-600",
    statusWarning: "bg-pink-500",

    // Neon Effects
    glowEffect: "shadow-purple-500/50",
    textGlow: "text-shadow-purple",

    // Urban Elements
    urban: {
      street: "text-purple-400",
      lights: "text-pink-400",
      compact: "text-purple-300",
      stylish: "text-pink-300",
      twilight: "text-purple-200"
    }
  },

  // ⚖️ 718 Cayman GT4 - Mid-Engine Balance (Zen Garden/Silver)
  caymanGT4: {
    name: "Cayman GT4",
    environment: "Zen Balance",
    primary: "slate-500",
    secondary: "slate-600",
    accent: "slate-400",
    gradient: "from-slate-500 via-gray-600 to-slate-700",
    text: "text-slate-400",
    textSecondary: "text-slate-200",
    textAccent: "text-slate-300",
    bg: "bg-slate-500",
    bgSecondary: "bg-slate-600",
    bgTertiary: "bg-slate-900",
    bgPattern: "bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900",
    border: "border-slate-500",
    borderSecondary: "border-slate-600/50",
    hover: "hover:text-slate-300",
    hoverBg: "hover:bg-slate-500/20",

    // Navigation - Minimalist Frame
    navBg: "bg-slate-900/95 backdrop-blur-md border-slate-500/40",
    navText: "text-slate-100",
    navHover: "hover:text-slate-400",
    navActive: "text-slate-400 border-b-2 border-slate-500",

    // Footer - Stone Base
    footerBg: "bg-slate-900 border-slate-500/30",
    footerText: "text-slate-300",
    footerHeading: "text-slate-400",
    footerHover: "hover:text-slate-300",

    // Cards - Perfect Symmetry
    cardBg: "bg-slate-900/50 backdrop-blur-sm",
    cardBorder: "border-slate-500/30",

    // Buttons - Precision Controls
    buttonPrimary: "bg-slate-500 hover:bg-slate-600 text-white",
    buttonSecondary: "bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-500",
    buttonOutline: "border-slate-500 text-slate-400 hover:bg-slate-500 hover:text-white",

    // Balance Status
    statusActive: "bg-slate-500",
    statusInactive: "bg-slate-700",
    statusWarning: "bg-gray-500",

    // Zen Effects
    glowEffect: "shadow-slate-500/30",
    textGlow: "text-shadow-slate",

    // Balance Elements
    balance: {
      center: "text-slate-400",
      precision: "text-slate-300",
      harmony: "text-gray-400",
      focus: "text-slate-500",
      zen: "text-slate-200"
    }
  },

  // 🌤️ 718 Boxster S - Convertible/Open-Top Fun (Sunset Beach/Coral)
  boxsterS: {
    name: "Boxster S",
    environment: "Sunset Beach",
    primary: "blue-500",
    secondary: "blue-600",
    accent: "blue-400",
    gradient: "from-blue-500 via-sky-500 to-blue-600",
    text: "text-blue-400",
    textSecondary: "text-blue-200",
    textAccent: "text-blue-300",
    bg: "bg-blue-500",
    bgSecondary: "bg-blue-600",
    bgTertiary: "bg-slate-900",
    bgPattern: "bg-gradient-to-br from-slate-900 via-blue-950 to-sky-950",
    border: "border-blue-500",
    borderSecondary: "border-blue-600/50",
    hover: "hover:text-blue-300",
    hoverBg: "hover:bg-blue-500/20",

    // Navigation - Crystal Clear
    navBg: "bg-slate-900/95 backdrop-blur-md border-blue-400/40",
    navText: "text-slate-100",
    navHover: "hover:text-blue-400",
    navActive: "text-blue-400 border-b-2 border-blue-500",

    // Footer - Scenic Route
    footerBg: "bg-slate-900/80 border-blue-400/30",
    footerText: "text-slate-300",
    footerHeading: "text-blue-400",
    footerHover: "hover:text-blue-300",

    // Cards - Open Road
    cardBg: "bg-slate-800/70 backdrop-blur-sm",
    cardBorder: "border-blue-400/30",

    // Buttons - Performance Blue
    buttonPrimary: "bg-blue-500 hover:bg-blue-600 text-white",
    buttonSecondary: "bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500",
    buttonOutline: "border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white",

    // Dynamic Status
    statusActive: "bg-blue-500",
    statusInactive: "bg-slate-600",
    statusWarning: "bg-yellow-500",

    // Crystal Effects
    glowEffect: "shadow-blue-400/50",
    textGlow: "text-shadow-blue",

    // Countryside Elements
    countryside: {
        sky: "text-sky-400",
        road: "text-slate-400",
        horizon: "text-blue-300",
        freedom: "text-blue-200",
        journey: "text-cyan-300"
    }
  }
};