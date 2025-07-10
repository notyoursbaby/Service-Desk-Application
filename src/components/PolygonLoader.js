import React from 'react';
import './PolygonLoader.css';

const PolygonLoader = () => {
  return (
    <div className="loader-container">
      <div className="polygon-loader">
        <div className="polygon"></div>
        <div className="polygon"></div>
        <div className="polygon"></div>
        <div className="polygon"></div>
        <div className="polygon"></div>
      </div>
      <p className="loading-text">Loading...</p>
    </div>
  );
};

export default PolygonLoader; 
