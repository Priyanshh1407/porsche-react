// Import individual car model data
import { gt3rs } from './modelsData/gt3rs.js';
import { turbos_911 } from './modelsData/turbos_911.js';
import { cayenne } from './modelsData/cayenne.js';
import { taycan } from './modelsData/taycan.js';
import { panamera } from './modelsData/panamera.js';
import { gt2rs_911 } from './modelsData/gt2rs_911.js';
import { spyder_918 } from './modelsData/spyder_918.js';
import { carreraGT } from './modelsData/carreraGT.js';
import { cayman_gt4rs } from './modelsData/cayman_gt4rs.js';
import { cayman_boxster } from './modelsData/cayman_boxster.js';
import { macan } from './modelsData/macan.js';

import Cayenne from '../pages/models/Cayenne.jsx';
import Panamera from '../pages/models/Panamera.jsx';
import Taycan from '../pages/models/Taycan.jsx';
import GT3RS from '../pages/models/GT3RS.jsx';
import GT2RS_911 from '../pages/models/GT2RS_911.jsx';
import TurboS_911 from '../pages/models/TurboS_911.jsx';
import Spyder_918 from '../pages/models/Spyder_918.jsx';
import CarreraGT from '../pages/models/CarreraGT.jsx';
import Cayman_GT4RS from '../pages/models/Cayman_GT4RS.jsx';
import CaymanBoxster from '../pages/models/CaymanBoxster.jsx';
import Macan from '../pages/models/Macan.jsx';

// Export individual models for direct import
export { gt3rs } from './modelsData/gt3rs.js';
export { turbos_911 } from './modelsData/turbos_911.js';
export { cayenne } from './modelsData/cayenne.js';
export { taycan } from './modelsData/taycan.js';
export { panamera } from './modelsData/panamera.js';
export { gt2rs_911 } from './modelsData/gt2rs_911.js';
export { spyder_918 } from './modelsData/spyder_918.js';
export { carreraGT } from './modelsData/carreraGT.js';
export { cayman_gt4rs } from './modelsData/cayman_gt4rs.js';
export { cayman_boxster } from './modelsData/cayman_boxster.js';
export { macan } from './modelsData/macan.js';

// Combined car data object for backward compatibility
export const carData = {
  gt3rs,
  gt2rs_911,
  turbos_911,
  cayenne,
  taycan,
  panamera,
  spyder_918,
  carreraGT,
  cayman_gt4rs,
  cayman_boxster,
  macan
};

export const modelRouteMap = {
  "911 GT3 RS": <GT3RS />,
  "911 GT2 RS": <GT2RS_911 />,
  "911 Turbo S": <TurboS_911 />,
  "Cayenne": <Cayenne />,
  "Taycan": <Taycan />,
  "Panamera": <Panamera />,
  "918 Spyder": <Spyder_918 />,
  "Carrera GT": <CarreraGT />,
  "718 Cayman GT4": <Cayman_GT4RS />,
  "718 Boxster S": <CaymanBoxster />,
  "Macan GTS": <Macan />
}

// Helper functions for working with car data
export const getCarByName = (name) => {
  return carData[name] || null;
};

export const getAllCars = () => {
  return Object.values(carData);
};

export const getCarNames = () => {
  return Object.keys(carData);
};

export const getCarsByCategory = () => {
  return {
    sportsCars: [carData.gt3rs, carData['911turbo']],
    suvs: [carData.cayenne],
    electric: [carData.taycan],
    sedans: [carData.panamera]
  };
};

export const searchCars = (query) => {
  const searchTerm = query.toLowerCase();
  return getAllCars().filter(car =>
    car.name.toLowerCase().includes(searchTerm) ||
    car.fullName.toLowerCase().includes(searchTerm) ||
    car.hero.subtitle.toLowerCase().includes(searchTerm)
  );
};

// Default export for convenience
export default carData;