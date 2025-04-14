import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/home.css";
import bgImage from "../assets/images/home-bg.jpg";
import logo from "../assets/images/iiitg-logo.png";
import { toast, ToastContainer } from "react-toastify";

const Home = () => {
  const navigate = useNavigate();

  const handleExplore = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?.email === "admin@iiitg.ac.in") {
      navigate("/adminprofile");
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    const loginSuccess = localStorage.getItem("showLoginSuccess");
    if (loginSuccess === "true") {
      setTimeout(() => {
        toast.success("Login successful!");
        localStorage.removeItem("showLoginSuccess");
      }, 300); // wait for ToastContainer to mount
    }
  }, []);

  return (
    <div
      className="home-container"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Info Section */}
      <div className="info-box">
        <h2>Welcome to IIIT Guwahati Hostel Management</h2>
        <p>
          A modern hostel management system designed for IIIT Guwahati students.
          Manage room allocations, student details, and more efficiently.
        </p>
        <button className="explore-btn" onClick={handleExplore}>
          Explore Now
        </button>
      </div>
    </div>
  );
};

export default Home;
