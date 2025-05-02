import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/home.css";
import bgImage from "../assets/images/home-bg.jpg";
// import logo from "../assets/images/iiitg-logo.png";
import toast, { Toaster } from 'react-hot-toast';
import { FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

const Home = () => {
  const navigate = useNavigate();

  const handleExplore = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      toast.error("Please login first!");
      return;
    }

    if (user?.email === "admin@iiitg.ac.in") {
      navigate("/adminprofile");
    }else if (user.email === "boysadmin@iiitg.ac.in") {
      navigate("/boysadminprofile"); // Changed to admin
    }
    else if (user.email === "girlsadmin@iiitg.ac.in") {
      navigate("/girlsadminprofile"); // Changed to admin
    }
     else {
      navigate("/");
    }
  };

  useEffect(() => {
    const loginSuccess = localStorage.getItem("showLoginSuccess");
    if (loginSuccess === "true") {
        // toast.success("Login successful!");
        localStorage.removeItem("showLoginSuccess");
    }
  }, []);

  return (
    <div
      className="home-container"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <Toaster position="top-center" reverseOrder={false} /> 
      {/* Info Section */}
      <motion.div 
        className="hero-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="info-box-home">
          <h1>Welcome to <span>IIITG Hostel Management</span></h1>
          <p className="subtitle">
            A modern, efficient system designed to streamline hostel operations and enhance student living experience at IIIT Guwahati.
          </p>
          <button className="explore-btn" onClick={handleExplore}>
            Explore Now <FaArrowRight className="btn-icon" />
          </button>
        </div>
      </motion.div>

      <footer className="footer">
        <p>© Created By Piyush B. Patale under guidance of Dr. Rakesh Matam {new Date().getFullYear()} IIIT Guwahati Hostel Management System</p>
        {/* <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div> */}
      </footer>
    </div>
    
  );
};

export default Home;
