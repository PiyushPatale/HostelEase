import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import axios from "axios";
import { Spin } from "antd";
import "../styles/Loggedinhome.css";

const { PUBLIC_SERVER_URL } = require("./api");

const host=PUBLIC_SERVER_URL

const LoggedInHome = ({ user }) => {
  const navigate = useNavigate();
  const [hostelStats, setHostelStats] = useState({
    boys: [],
    girls: [],
    annexureI: [],
    annexureII: [],
  });
  const [userHostelType, setUserHostelType] = useState(null);
  const [loading, setLoading] = useState({
    boys: true,
    girls: true,
    annexureI: true,
    annexureII: true
  });

  useEffect(() => {
    const loginSuccess = localStorage.getItem("showLoginSuccess");
    if (loginSuccess === "true") {
      setTimeout(() => {
        toast.success("Login successful!");
        localStorage.removeItem("showLoginSuccess");
      }, 300);
    }

    fetchRoomData();
  }, []);

  useEffect(() => {
    if (user?.roomNumber) {
      determineHostelType(user.roomNumber);
    }
  }, [user?.roomNumber]);

  const determineHostelType = (roomNumber) => {
    const roomStr = roomNumber.toString();
    if (roomStr.startsWith("G")) {
      setUserHostelType("girls");
    } else if (roomStr.startsWith("A")) {
      setUserHostelType("annexureI");
    } else if (roomStr.startsWith("B")) {
      setUserHostelType("annexureII");
    } else {
      setUserHostelType("boys");
    }
  };

  const fetchRoomData = async () => {
    try {
      const [vacantRes, occupiedRes] = await Promise.all([
        axios.get(`${host}/api/rooms/vacant`),
        axios.get(`${host}/api/rooms/occupied`),
      ]);

      const allRooms = [...vacantRes.data, ...occupiedRes.data];

      const processHostelData = (rooms, hostelPrefix, floors) => {
        return floors.map((floor) => {
          const floorRooms = rooms.filter((room) => {
            const roomNumberStr = room.roomNumber.toString();
            if (hostelPrefix === "G") {
              return roomNumberStr.startsWith(`G-${floor.id}`);
            } else if (hostelPrefix === "") {
              return /^\d+$/.test(roomNumberStr) && Math.floor(parseInt(roomNumberStr) / 100) === floor.id;
            } else {
              return roomNumberStr.startsWith(hostelPrefix);
            }
          });
      
          const occupied = floorRooms.filter((room) =>
            occupiedRes.data.some((r) => r.roomNumber === room.roomNumber)
          ).length;
      
          return {
            id: floor.id,
            name: floor.name,
            occupied,
            vacant: floorRooms.length - occupied,
            total: floorRooms.length,
          };
        });
      };
      

      // Update each hostel section individually
      setHostelStats(prev => {
        const boys = processHostelData(
          allRooms,
          "",
          Array.from({ length: 8 }, (_, i) => ({
            id: i,
            name: i === 0 ? "Ground Floor" : `${i}th Floor`,
          }))
        );
        setLoading(prevLoading => ({...prevLoading, boys: false}));
        return {...prev, boys};
      });

      setHostelStats(prev => {
        const girls = processHostelData(
          allRooms.filter((room) => room.roomNumber.toString().startsWith("G")),
          "G",
          [
            { id: 0, name: "Ground Floor" },
            { id: 1, name: "1st Floor" },
            { id: 2, name: "2nd Floor" },
            { id: 3, name: "3rd Floor" },
          ]
        );
        setLoading(prevLoading => ({...prevLoading, girls: false}));
        return {...prev, girls};
      });

      setHostelStats(prev => {
        const annexureI = processHostelData(
          allRooms.filter((room) => room.roomNumber.toString().startsWith("A")),
          "A",
          [{ id: 0, name: "Ground Floor" }]
        );
        setLoading(prevLoading => ({...prevLoading, annexureI: false}));
        return {...prev, annexureI};
      });

      setHostelStats(prev => {
        const annexureII = processHostelData(
          allRooms.filter((room) => room.roomNumber.toString().startsWith("B")),
          "B",
          [{ id: 0, name: "Ground Floor" }]
        );
        setLoading(prevLoading => ({...prevLoading, annexureII: false}));
        return {...prev, annexureII};
      });

    } catch (error) {
      console.error("Failed to fetch room data:", error);
      setLoading({
        boys: false,
        girls: false,
        annexureI: false,
        annexureII: false
      });
      toast.error("Failed to load hostel data");
    }
  };

  const getRelevantStats = () => {
    switch (userHostelType) {
      case "annexureI":
        return {
          title: "Annexure I (Ground Floor)",
          stats: hostelStats.annexureI,
          color: "#4CAF50",
          isAnnexure: true,
          loading: loading.annexureI,
          type: "annexureI",
          prefix: "A",
          isSingleFloor: true
        };
      case "annexureII":
        return {
          title: "Annexure II (Ground Floor)",
          stats: hostelStats.annexureII,
          color: "#9C27B0",
          isAnnexure: true,
          loading: loading.annexureII,
          type: "annexureII",
          prefix: "B",
          isSingleFloor: true
        };
      case "girls":
        return {
          title: "Girls Hostel Floors",
          stats: hostelStats.girls,
          color: "#E91E63",
          isAnnexure: false,
          loading: loading.girls,
          type: "girls",
          prefix: "G-",
          isSingleFloor: false
        };
      default:
        return {
          title: "Boys Hostel Floors",
          stats: hostelStats.boys,
          color: "#2196F3",
          isAnnexure: false,
          loading: loading.boys,
          type: "boys",
          prefix: "",
          isSingleFloor: false    
        };
    }
  };

  const relevantStats = getRelevantStats();

  const handleFloorClick = (floorId, hostelType, prefix, isSingleFloor) => {
    const floorNumber = isSingleFloor ? prefix : `${prefix}${floorId}`;
    navigate(`/floor/${floorNumber}?hostel=${hostelType}`);
  };

  return (
    <div className="loggedin-home">
      <Toaster position="top-center" reverseOrder={false} /> 
      <div className="dashboard-layout">
        {/* Left Panel */}
        <div className="left-panel">
          <div className="welcome-banner">
            <h1>Welcome Back!</h1>
            <p>{user?.name || "Student"}</p>
            {user?.roomNumber && (
              <p className="room-info">
                Your Room: {user.roomNumber} (
                {userHostelType === "girls"
                  ? "Girls Hostel"
                  : userHostelType === "annexureI"
                  ? "Annexure I"
                  : userHostelType === "annexureII"
                  ? "Annexure II"
                  : "Boys Hostel"}
                )
              </p>
            )}
          </div>

          <div className="quick-actions">
            <button
              className="action-btn my-room-btn"
              onClick={() => navigate("/my-room")}
            >
              View My Room Details
            </button>
            <button 
              className="action-btn rules-btn"
              onClick={() => navigate("/hostelrg")}
            >
              Hostel Rules & Guidelines
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <div className="right-panel-content">
            <h2 className="floors-title">{relevantStats.title}</h2>
            
            {relevantStats.loading ? (
              <div className="section-loader">
                <Spin size="large" />
              </div>
            ) : (
              <div className={`floors-grid ${relevantStats.isAnnexure ? "single-floor" : ""}`}>
                {relevantStats.stats.map((floor) => (
                  <FloorCard
                    key={floor.id}
                    floor={floor}
                    color={relevantStats.color}
                    onClick={() => handleFloorClick(floor.id, relevantStats.type, relevantStats.prefix, relevantStats.isSingleFloor)}
                  />
                ))}
              </div>
            )}

            {/* Show other hostel stats if in boys hostel */}
            {userHostelType === "boys" && (
              <>
                <h2 className="floors-title annexure-title">Annexure I</h2>
                {loading.annexureI ? (
                  <div className="section-loader">
                    <Spin size="large" />
                  </div>
                ) : (
                  <div className="floors-grid single-floor annexure">
                    {hostelStats.annexureI.map((floor) => (
                      <FloorCard
                        key={`annexureI-${floor.id}`}
                        floor={floor}
                        color="#4CAF50"
                        onClick={() => handleFloorClick(floor.id, "annexureI", "A", true)}
                      />
                    ))}
                  </div>
                )}

                <h2 className="floors-title annexure-title">Annexure II </h2>
                {loading.annexureII ? (
                  <div className="section-loader">
                    <Spin size="large" />
                  </div>
                ) : (
                  <div className="floors-grid single-floor annexure">
                    {hostelStats.annexureII.map((floor) => (
                      <FloorCard
                        key={`annexureII-${floor.id}`}
                        floor={floor}
                        color="#9C27B0"
                        onClick={() => handleFloorClick(floor.id, "annexureII", "B", true)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// FloorCard Component
const FloorCard = ({ floor, color = "#3498db", onClick }) => {
  const percentage = floor.total
    ? Math.round((floor.occupied / floor.total) * 100)
    : 0;

  return (
    <div className="floor-card" onClick={onClick}>
      <h3>{floor.name}</h3>
      <div className="occupancy-circle">
        <div
          className="circle-progress"
          style={{
            background: `conic-gradient(
              ${color} ${percentage}%, 
              #ecf0f1 ${percentage}% 100%
            )`,
          }}
        >
          <div className="circle-inner">
            <span>{percentage}%</span>
          </div>
        </div>
      </div>
      <div className="floor-stats">
        <p>Occupied: {floor.occupied}</p>
        <p>Vacant: {floor.vacant}</p>
        <p>Total: {floor.total}</p>
      </div>
    </div>
  );
};

export default LoggedInHome;

