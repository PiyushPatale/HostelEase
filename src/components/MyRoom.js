import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MyRoom.css";

const MyRoom = () => {
  const navigate = useNavigate();
  const [roomDetails, setRoomDetails] = useState(null);
  const [roommate, setRoommate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const userId = storedUser ? JSON.parse(storedUser).id : null;

        if (!userId) {
          console.error("User ID not found in localStorage");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5000/api/users/my-room", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ userId })
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Server returned error:", data.message);
          setLoading(false);
          return;
        }

        setRoomDetails(data.roomDetails);
        setRoommate(data.roommate);
      } catch (error) {
        console.error("Error fetching room details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your room details...</p>
      </div>
    );
  }

  return (
    <div className="my-room-container">
      <div className="room-headers">
        <h1>My Room Details</h1>
      </div>

      <div className="room-details-card">
        <div className="room-info">
          <h2>Room Information</h2>
          <div className="detail-item">
            <span className="detail-label">Room Number:</span>
            <span className="detail-value">{roomDetails.roomNumber}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Hostel:</span>
            <span className="detail-value">{roomDetails.hostel}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Floor:</span>
            <span className="detail-value">{roomDetails.floor}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Room Type:</span>
            <span className="detail-value">{roomDetails.type}</span>
          </div>

          <h3 className="amenities-title">Amenities</h3>
          <ul className="amenities-list">
            {roomDetails.amenities.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="roommate-info">
          <h2>Roommate Details</h2>
          {roommate ? (
            <>
              <div className="detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{roommate.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Roll Number:</span>
                <span className="detail-value">{roommate.rollNumber}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{roommate.contact}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone Number :</span>
                <span className="detail-value">{roommate.department}</span>
              </div>
            </>
          ) : (
            <p className="no-roommate">You don't have a roommate assigned yet.</p>
          )}
        </div>
      </div>

      <div className="action-buttons">
        <button
          className="report-issue-btn"
          onClick={() =>
            window.open(
              "https://docs.google.com/forms/d/e/1FAIpQLSc-ROYEDelQadE96_1lfcKcectqBO6jcOc48KdX61l_HesgHw/viewform",
              "_blank"
            )
          }
        >
          Report Maintenance Issue
        </button>
        <button className="back-btn" onClick={() => navigate(-1)}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default MyRoom;
