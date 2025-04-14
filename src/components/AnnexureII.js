import React from 'react';
import { useNavigate } from "react-router-dom";
import annexureBg from "../assets/images/Annexure-I.png";
import "../styles/AnnexureII.css";

function AnnexureII() {
    const navigate = useNavigate();
    
    const handleNavigate = () => {
        navigate("/floor/B");
    };

    return (
        <div className="annexure-page">
            <div
                className="annexure-container"
                style={{ backgroundImage: `url(${annexureBg})` }}
            >
                {/* Left-side hover overlay */}
                <div 
                    className="hover-overlay left"
                    onClick={handleNavigate}
                >
                    <div className="overlay-content">
                        <h2>Annexure - II</h2>
                        <p>Click to view floor details</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnnexureII;