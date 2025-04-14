import React from "react";
import { useNavigate } from "react-router-dom";
import logoImage from "../assets/images/iiitg-logo.png"; // Ensure your logo is stored in the assets folder
import "./FloatingNavbar.css"; // Import the CSS file for styling

const FloatingNavbar = () => {
  const navigate = useNavigate(); // To navigate between pages

  return (
    <div className="floating-navbar">
      {/* Floating Logo Button */}
      <button className="logo-button" onClick={() => navigate("/")}>
        <img src={logoImage} alt="IIITG Hostel" />
      </button>

      {/* Floating Buttons in the Right Upper Corner */}
      <div className="nav-buttons">
        <button className="nav-btn profile-btn" onClick={() => navigate("/profile")}>
          Profile
        </button>
        <button className="nav-btn logout-btn" onClick={() => navigate("/logout")}>
          Logout
        </button>
        <button className="nav-btn about-btn" onClick={() => navigate("/about")}>
          About Us
        </button>
      </div>
    </div>
  );
};

export default FloatingNavbar;
