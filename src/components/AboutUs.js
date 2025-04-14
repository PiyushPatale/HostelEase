import React from "react";
import "../styles/aboutus.css";

const AboutUs = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About <span>HostelEase</span></h1>
        <div className="header-decoration"></div>
      </div>
      
      <div className="about-content">
        <div className="about-card">
          <div className="card-icon">🏠</div>
          <h2>Our Mission</h2>
          <p>
            Welcome to <strong>HostelEase</strong>, a modern web platform designed
            to revolutionize hostel management. We're committed to eliminating
            the headaches of manual processes through intuitive digital solutions.
          </p>
        </div>

        <div className="about-card">
          <div className="card-icon">👨‍🎓</div>
          <h2>For Students</h2>
          <p>
            Students enjoy a <strong>seamless experience</strong> viewing room allocations,
            checking amenities, and accessing hostel information - all in one place.
            No more paperwork or long queues!
          </p>
        </div>

        <div className="about-card">
          <div className="card-icon">👨‍💼</div>
          <h2>For Administrators</h2>
          <p>
            Admins get <strong>powerful tools</strong> to manage records, track occupancy,
            and generate reports with just a few clicks. Our dashboard provides
            real-time insights into hostel operations.
          </p>
        </div>

        <div className="tech-stack">
          <h3>Built With Modern Technologies</h3>
          <div className="tech-icons">
            <span>React</span>
            <span>Node.js</span>
            <span>MongoDB</span>
            <span>Express</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;


