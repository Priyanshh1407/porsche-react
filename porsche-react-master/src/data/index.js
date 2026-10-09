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

// Model routing lives in data/models.js (URLs) and data/modelPages.js (components).

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
    sportsCars: [carData.gt3rs, carData.turbos_911],
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