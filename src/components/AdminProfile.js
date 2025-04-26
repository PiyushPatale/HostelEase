import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminProfile.css";
import { FaUser, FaTachometerAlt, FaBuilding, FaCog, FaChevronDown, FaChevronUp, FaMale, FaFemale, FaIdCard, FaEnvelope, FaShieldAlt, FaCalendarAlt } from "react-icons/fa";

const AdminProfile = () => {
  const [admin, setAdmin] = useState(JSON.parse(localStorage.getItem("user")));
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [hostelsDropdownOpen, setHostelsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!admin || admin.email !== "admin@iiitg.ac.in") {
      navigate("/adminprofile");
    }
  }, [admin, navigate]);

  if (!admin) return <div className="access-denied">Access Denied</div>;

  return (
    <>
      <div className="admin-profile-wrapper">
        <div className="admin-profile-container">
          <div className="admin-sidebar">
            <div className="admin-avatar">
              <div className="avatar-circle">
                {admin.name ? admin.name.charAt(0).toUpperCase() : "A"}
              </div>
              <h3>{admin.name || "Admin"}</h3>
              <p>System Administrator</p>
            </div>

            <nav className="admin-menu">
              <button
                className={activeTab === "profile" ? "active" : ""}
                onClick={() => setActiveTab("profile")}
              >
                <FaUser className="menu-icon" /> Profile
              </button>
              <button
                className={activeTab === "dashboard" ? "active" : ""}
                onClick={() => navigate("/admin-dashboard")}
              >
                <FaTachometerAlt className="menu-icon" /> Dashboard
              </button>

              <div className={`dropdown-container ${hostelsDropdownOpen ? "open" : ""}`}>
                <button 
                  className={`dropdown-toggle ${hostelsDropdownOpen ? "active" : ""}`}
                  onClick={() => setHostelsDropdownOpen(!hostelsDropdownOpen)}
                >
                  <FaBuilding className="menu-icon" /> Hostels
                  {hostelsDropdownOpen ? <FaChevronUp className="dropdown-chevron" /> : <FaChevronDown className="dropdown-chevron" />}
                </button>
                <div className="dropdown-menu">
                  <button 
                    className="dropdown-item"
                    onClick={() => navigate("/boys-hostel")}
                  >
                    <FaMale className="dropdown-icon" /> Boy's Hostel
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => navigate("/annexure-I")}
                  >
                    <FaBuilding className="dropdown-icon" /> Annexure-I
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => navigate("/annexure-II")}
                  >
                    <FaBuilding className="dropdown-icon" /> Annexure-II
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => navigate("/girls-hostel")}
                  >
                    <FaFemale className="dropdown-icon" /> Girl's Hostel
                  </button>
                </div>
              </div>

              <button
                className={activeTab === "settings" ? "active" : ""}
                onClick={() => setActiveTab("settings")}
              >
                <FaCog className="menu-icon" /> Settings
              </button>
            </nav>
          </div>

          <div className="admin-content">
            <div className="scrollable-content">
              {activeTab === "profile" && (
                <div className="profile-section">
                  <h2>Admin Profile</h2>
                  <div className="profile-details">
                    <div className="detail-card">
                      <div className="detail-icon">
                        <FaIdCard />
                      </div>
                      <div>
                        <h4>Full Name</h4>
                        <p>{admin.name || "Administrator"}</p>
                      </div>
                    </div>

                    <div className="detail-card">
                      <div className="detail-icon">
                        <FaEnvelope />
                      </div>
                      <div>
                        <h4>Email Address</h4>
                        <p>{admin.email}</p>
                      </div>
                    </div>

                    <div className="detail-card">
                      <div className="detail-icon">
                        <FaShieldAlt />
                      </div>
                      <div>
                        <h4>Role</h4>
                        <p>System Administrator</p>
                      </div>
                    </div>

                    <div className="detail-card">
                      <div className="detail-icon">
                        <FaCalendarAlt />
                      </div>
                      <div>
                        <h4>Last Login</h4>
                        <p>{new Date().toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="settings-section">
                  <h2>Account Settings</h2>
                  <div className="settings-form">
                    <div className="form-group">
                      <label>Change Password</label>
                      <input type="password" placeholder="Current password" />
                      <input type="password" placeholder="New password" />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                      />
                      <button className="save-btn">Update Password</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminProfile;