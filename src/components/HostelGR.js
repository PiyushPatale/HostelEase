import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HostelGR.css";

const HostelGR = () => {
  const navigate = useNavigate();

  return (
    <div className="hostel-gr-container">
      <div className="hostel-gr-header">
        <h1>Hostel Rules & Guidelines</h1>
        <p>Please read and follow these rules for a harmonious living environment</p>
      </div>

      <div className="rules-container">
        <div className="rules-section">
          <h2>General Rules</h2>
          <ul>
            <li>All residents must carry their ID cards at all times</li>
            <li>If your ID card lost, please bring a Police complaint sheet for new ID Card</li>
            <li>Strict quiet hours from 10:00 PM to 6:00 AM</li>
            <li>No unauthorized overnight guests allowed</li>
            <li>Smoking and alcohol consumption strictly prohibited</li>
            <li>Residents must keep their rooms and common areas clean</li>
          </ul>
        </div>

        <div className="rules-section">
          <h2>Safety Guidelines</h2>
          <ul>
            <li>Do not tamper with fire safety equipment</li>
            <li>Report any electrical issues immediately</li>
            <li>Keep emergency exits clear at all times</li>
            <li>No cooking in rooms - use designated kitchen areas</li>
            <li>Sign in/out when leaving campus overnight</li>
          </ul>
        </div>

        <div className="rules-section">
          <h2>Facility Usage</h2>
          <ul>
            <li>Laundry room open from 7:00 AM to 10:00 PM</li>
            <li>Gym usage requires ID Cards.</li>
            <li>Common room must be vacated by 11:00 PM</li>
            <li>No personal furniture allowed in rooms</li>
            <li>Report maintenance issues within 24 hours</li>
          </ul>
        </div>
      </div>

      <div className="acknowledgement-section">
        <h3>Important Notice</h3>
        <p>
          Violation of these rules may result in disciplinary action including fines,
          suspension of hostel privileges, or expulsion from the hostel. The hostel
          administration reserves the right to amend these rules as necessary.
        </p>
        <button 
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default HostelGR;