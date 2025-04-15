import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import annexureBg from "../assets/images/Annexure-I.png";
import "../styles/Annexure.css";

const AnnexureI = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleNavigate = () => {
    navigate("/floor/A");
  };

  const handleMouseEnter = (e, content) => {
    if (location.search.includes("?")) {
      setTooltipContent(content);
      setTooltipPosition({ x: e.clientX, y: e.clientY });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };


  return (
    <div className="annexure-page">
      <div
        className="annexure-container"
        style={{ backgroundImage: `url(${annexureBg})` }}
      >

        {/* Right-side hover overlay */}
        <div 
          className="hover-overlay right"
          onClick={handleNavigate}
        >
          <div className="overlay-content">
            <h2>Annexure - I</h2>
            <p>Click to view details</p>
          </div>
        </div>

        {/* Tooltip */}
        {showTooltip && (
          <div 
            className="description-tooltip"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y + 20}px`
            }}
          >
            {tooltipContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnexureI;