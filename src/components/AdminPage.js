import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bgImageHostel from "../assets/images/123.jpeg";
import hostelImage from "../assets/images/hotel_side_view.png";
import "./AdminPage.css";
import Navbar from "./Navbar";
import FloatingNavbar from "./FloatingNavbar";

const AdminPage = () => {
  const navigate = useNavigate();
  const [slidLeft, setSlidLeft] = useState(false);
  const [hoveredFloor, setHoveredFloor] = useState(null);
  const imageRef = useRef(null);

  const floors = [
    { id: 0, name: "Ground Floor", top: "87%", height: "10%" },
    { id: 1, name: "Floor 1", top: "77%", height: "10%" },
    { id: 2, name: "Floor 2", top: "67%", height: "10%" },
    { id: 3, name: "Floor 3", top: "55%", height: "10%" },
    { id: 4, name: "Floor 4", top: "45%", height: "10%" },
    { id: 5, name: "Floor 5", top: "35%", height: "10%" },
    { id: 6, name: "Floor 6", top: "25%", height: "10%" },
    { id: 7, name: "Floor 7", top: "14%", height: "10%" },
  ];


  const handleFloorHover = (floorId) => {
    setHoveredFloor(floorId);
  };

  const handleFloorLeave = () => {
    setHoveredFloor(null);
  };

  const handleFloorClick = (floorId, e) => {
    e.stopPropagation();
    navigate(`/floor/${floorId}`);
  };

  return (
    <>
      {/* <FloatingNavbar/> */}
      <div
        className="admin-container"
        style={{ backgroundImage: `url(${bgImageHostel})` }}
      >
        {!slidLeft && (
          <div className="info-box">
            <h2>Welcome to Boy's Hostel !</h2>
            <p>Hover over different floors to see options</p>
            <button
              className="dashboard-btn"
              onClick={() => navigate("/admin-dashboard")}
            >
              Go to Dashboard
            </button>
          </div>
        )}

        <div className={`hostel-container ${slidLeft ? "slid-left" : ""}`}>
          <div className="hostel-image-wrapper" ref={imageRef}>
            <div className="floor-interaction-area">
              {floors.map((floor) => (
                <div
                  key={floor.id}
                  className="floor-hover-zone"
                  style={{
                    top: floor.top,
                    height: floor.height,
                  }}
                  onClick={(e) => handleFloorClick(floor.id, e)}
                >
                  <div className="floor-button-container">
                    <button className={`floor-button floor-${floor.id}`}>
                      {floor.name}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPage;
