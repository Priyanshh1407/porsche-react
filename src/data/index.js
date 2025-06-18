// Import individual car model data
import { gt3rs } from './modelsData/gt3rs.js';
import { gt3_911 } from './modelsData/gt3_911.js';
import { cayenne } from './modelsData/cayenne.js';
import { taycan } from './modelsData/taycan.js';
import { panamera } from './modelsData/panamera.js';

// Export individual models for direct import
export { gt3rs } from './modelsData/gt3rs.js';
export { gt3_911 } from './modelsData/gt3_911.js';
export { cayenne } from './modelsData/cayenne.js';
export { taycan } from './modelsData/taycan.js';
export { panamera } from './modelsData/panamera.js';

// Combined car data object for backward compatibility
export const carData = {
  gt3rs,
  gt3_911,
  cayenne,
  taycan,
  panamera
};

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