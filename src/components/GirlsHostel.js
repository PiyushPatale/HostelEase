import React from "react";
import { useNavigate } from "react-router-dom";
import girlsHostelBg from "../assets/images/GirlsHostel.jpeg";
import "../styles/GirlsHostel.css";

function GirlsHostel() {
  const navigate = useNavigate();

  const floors = [
    { id: 3, label: "3rd Floor", value: "G-3" },
    { id: 2, label: "2nd Floor", value: "G-2" },
    { id: 1, label: "1st Floor", top: "77%", value: "G-1" },
    { id: 0, label: "Ground Floor", value: "G-0" },
  ];

  return (
    <div
      className="girls-hostel-container"
      style={{ backgroundImage: `url(${girlsHostelBg})` }}
    >
        <div className="info-box">
            <h2>Welcome to Girl's Hostel !</h2>
            <p>Hover over different floors to see Roo</p>
            <button
              className="dashboard-btn"
              onClick={() => navigate("/admin-dashboard")}
            >
              Go to Dashboard
            </button>
          </div>
      <div className="floor-overlay-grid">
        {floors.map((floor) => (
          <div
            key={floor.id}
            className="floor-box"
            onClick={() => navigate(`/floor/${floor.value}`)}
          >
            {floor.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GirlsHostel;
