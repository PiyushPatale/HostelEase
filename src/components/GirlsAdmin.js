import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminProfile.css";
import toast, { Toaster } from "react-hot-toast";
import {
  FaUser,
  FaTachometerAlt,
  FaBuilding,
  FaCog,
  FaChevronDown,
  FaChevronUp,
  FaMale,
  FaFemale,
  FaIdCard,
  FaEnvelope,
  FaShieldAlt,
  FaCalendarAlt,
  FaExchangeAlt,
} from "react-icons/fa";
import RoomChangeRequests from "./RoomChangeRequests";
const { PUBLIC_SERVER_URL } = require("./api");
const host = PUBLIC_SERVER_URL;

function GirlsAdmin() {
  const [admin, setAdmin] = useState(JSON.parse(localStorage.getItem("user")));
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [hostelsDropdownOpen, setHostelsDropdownOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const token = localStorage.getItem("token");

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    try {
      const response = await fetch(`${host}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      // console.log(currentPassword);
      // console.log(newPassword);
      // console.log(confirmPassword);

      if (response.ok) {
        toast.success("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("Something went wrong. Try again.");
    }
  };

  useEffect(() => {
    if (!admin || admin.email !== "girlsadmin@iiitg.ac.in") {
      navigate("/girlsadminprofile");
    }
  }, [admin, navigate]);

  if (!admin) return <div className="access-denied">Access Denied</div>;

  return (
    <>
      <div className="admin-profile-wrapper">
        <Toaster position="top-center" reverseOrder={false} />
        <div className="admin-profile-container">
          <div className="admin-sidebar">
            <div className="admin-avatar">
              <div className="avatar-circle">
                {admin.name ? admin.name.charAt(0).toUpperCase() : "A"}
              </div>
              <h3>{admin.name || "Girls Admin"}</h3>
              <p>Girls Hostel Warden</p>
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

              <div
                className={`dropdown-container ${
                  hostelsDropdownOpen ? "open" : ""
                }`}
              >
                <button
                  className={`dropdown-toggle ${
                    hostelsDropdownOpen ? "active" : ""
                  }`}
                  onClick={() => setHostelsDropdownOpen(!hostelsDropdownOpen)}
                >
                  <FaBuilding className="menu-icon" /> Hostels
                  {hostelsDropdownOpen ? (
                    <FaChevronUp className="dropdown-chevron" />
                  ) : (
                    <FaChevronDown className="dropdown-chevron" />
                  )}
                </button>
                <div className="dropdown-menu">
                  <button
                    className="dropdown-item disabled"
                    onClick={() =>
                      toast.error(
                        "Access Denied: Boys Hostel Warden cannot access Girl's Hostel."
                      )
                    }
                    disabled
                    style={{ opacity: 0.5, cursor: "not-allowed" }}
                  >
                    <FaMale className="dropdown-icon" /> Boy's Hostel
                  </button>
                  <button
                    className="dropdown-item disabled"
                    onClick={() =>
                      toast.error(
                        "Access Denied: Boys Hostel Warden cannot access Girl's Hostel."
                      )
                    }
                    disabled
                    style={{ opacity: 0.5, cursor: "not-allowed" }}
                  >
                    <FaBuilding className="dropdown-icon" /> Annexure-I
                  </button>
                  <button
                    className="dropdown-item disabled"
                    onClick={() =>
                      toast.error(
                        "Access Denied: Boys Hostel Warden cannot access Girl's Hostel."
                      )
                    }
                    disabled
                    style={{ opacity: 0.5, cursor: "not-allowed" }}
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
                className={activeTab === "requests" ? "active" : ""}
                onClick={() => setActiveTab("requests")}
              >
                <FaExchangeAlt className="menu-icon" /> Room Requests
              </button>

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

              {activeTab === "requests" && (
                <div className="requests-section">
                  <RoomChangeRequests adminType="girls" />
                </div>
              )}

              {activeTab === "settings" && (
                <div className="settings-section">
                  <h2>Account Settings</h2>
                  <div className="settings-form">
                    <div className="form-group">
                      <label>Change Password</label>
                      <input
                        type="password"
                        placeholder="Current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        className="save-btn"
                        onClick={handlePasswordUpdate}
                      >
                        Update Password
                      </button>
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
}

export default GirlsAdmin;
