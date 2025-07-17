'use client';
import React, { createContext, useContext, useState } from 'react';

const LayersContext = createContext();

export const LayersProvider = ({ children }) => {
  const [layers, setLayers] = useState([]);
  return (
    <LayersContext.Provider value={{ layers, setLayers }}>
      {children}
    </LayersContext.Provider>
  );
};

export const useLayers = () => {
  const context = useContext(LayersContext);
  if (!context) {
    throw new Error('useLayers must be used within a LayersProvider');
  }
  return context;
};
