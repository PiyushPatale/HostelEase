import React, { useEffect, useState } from "react";
import axios from "axios";
import { Select } from 'antd';
// import User from "../../backend/models/User";

const { PUBLIC_SERVER_URL } = require("./api");
const host = PUBLIC_SERVER_URL;

const { Option } = Select;

const RoomChangeForm = ({ user, onSuccess, onCancel, isVisible }) => {
  const [requestedRoom, setRequestedRoom] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [vacantRooms, setVacantRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const getHostelType = () => {
    if (!user?.roomNumber) return "";
    return user.roomNumber.toString().startsWith("G") ? "girls" : "boys";
  };

  useEffect(() => {
    if (isVisible && user?.roomNumber) {
      fetchVacantRooms();
    }
  }, [isVisible, user?.roomNumber]);

  const fetchVacantRooms = async () => {
    setLoadingRooms(true);
    try {
      const response = await axios.get(`${host}/api/rooms/vacant`);
      // console.log(response.data)
      const allRooms = response.data;

      // Filter rooms based on hostel type
      const filteredRooms = allRooms.filter((room) => {
        const roomStr = room.roomNumber.toString();
        return getHostelType() === "girls"
          ? roomStr.startsWith("G")
          : !roomStr.startsWith("G");
      });

      setVacantRooms(filteredRooms);
    } catch (error) {
      console.error("Error fetching vacant rooms:", error);
      setMessage("Failed to load available rooms");
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestedRoom) {
      setMessage("Please select a room");
      return;
    }

    setIsLoading(true);

    try {
      // console.log("Submitting request with:", {
      //   userId: user.id,
      //   currentRoom: user.roomNumber,
      //   requestedRoom,
      //   reason,
      // });
      await axios.post(`${host}/api/room/request-room-change`, {
        userId: user.id,
        currentRoom: user.roomNumber,
        requestedRoom,
        reason,
      });

      setMessage("Request submitted successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      setMessage(err.response?.data?.message || "Error submitting request");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "500px",
        }}
      >
        <h2
          style={{
            marginBottom: "1.5rem",
            color: "#333",
            textAlign: "center",
          }}
        >
          Request Room Change
        </h2>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
            }}
          >
            <label>Current Room:</label>
            <input
              type="text"
              value={user.roomNumber}
              readOnly
              style={{
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "1rem",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
            }}
          >
            <label>Requested Room:</label>
            <Select
              showSearch
              placeholder={loadingRooms ? "Loading rooms..." : "Select a room"}
              optionFilterProp="children"
              onChange={setRequestedRoom}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              style={{ width: "100%" }}
              loading={loadingRooms}
              disabled={loadingRooms}
            >
              {vacantRooms.map((room) => (
                <Option key={room.roomNumber} value={room.roomNumber}>
                  {room.roomNumber} (
                  {room.type || getHostelType() === "girls"
                    ? "Girls Hostel"
                    : "Boys Hostel"}
                  )
                </Option>
              ))}
            </Select>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
            }}
          >
            <label>Reason:</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              style={{
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "1rem",
                resize: "vertical",
                minHeight: "100px",
              }}
              rows={4}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "1rem",
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem",
                backgroundColor: "#f5f5f5",
                border: "1px solid #ddd",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                opacity: isLoading ? "0.7" : "1",
              }}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
          {message && (
            <div
              style={{
                marginTop: "1rem",
                padding: "0.5rem",
                borderRadius: "4px",
                textAlign: "center",
                backgroundColor: message.includes("success")
                  ? "#e6ffed"
                  : "#fff2f0",
                color: message.includes("success") ? "#2d7a4d" : "#d4380d",
              }}
            >
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RoomChangeForm;
