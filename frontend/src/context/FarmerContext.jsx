import React, { createContext, useContext, useState } from 'react';
import { MOCK_FARMER_PROFILE } from '../services/mockData';

const FarmerContext = createContext();

export const FarmerProvider = ({ children }) => {
  const [selectedCrop, setSelectedCrop] = useState(MOCK_FARMER_PROFILE.currentCrop);
  const [farmerLocation, setFarmerLocation] = useState(MOCK_FARMER_PROFILE.location);
  const [analyzeModalOpen, setAnalyzeModalOpen] = useState(false);

  const updateCrop = (cropData) => {
    setSelectedCrop((prev) => ({ ...prev, ...cropData }));
  };

  const updateLocation = (loc) => {
    setFarmerLocation(loc);
  };

  return (
    <FarmerContext.Provider
      value={{
        selectedCrop,
        farmerLocation,
        analyzeModalOpen,
        setAnalyzeModalOpen,
        updateCrop,
        updateLocation
      }}
    >
      {children}
    </FarmerContext.Provider>
  );
};

export const useFarmer = () => useContext(FarmerContext);
