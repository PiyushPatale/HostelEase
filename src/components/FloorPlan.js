import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUser, FiX, FiRepeat } from "react-icons/fi";
import axios from "axios";
import "./FloorPlan.css";
import { LuShuffle } from "react-icons/lu";
// import { ClipLoader } from "react-spinners"; // Loader
import { Modal } from "antd";

import { Spin } from "antd";
import { toast, ToastContainer } from "react-toastify";

const FloorPlan = () => {
  const { floorNumber } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const [rooms, setRooms] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [studentToMove, setStudentToMove] = useState(null);
  const [vacantRooms, setVacantRooms] = useState([]);
  const [selectedRoomForMove, setSelectedRoomForMove] = useState("");
  const [isVacantLoading, setIsVacantLoading] = useState(false); // For move modal
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [eligibleSwapRooms, setEligibleSwapRooms] = useState([]);
  const [selectedSwapRoom, setSelectedSwapRoom] = useState("");
  const [swapCandidates, setSwapCandidates] = useState([]);
  const [studentToSwapWith, setStudentToSwapWith] = useState(null);

  const modalRef = useRef();
  const isAdmin = user?.email === "admin@iiitg.ac.in";

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/api/rooms");
        const allRooms = response.data;

        let filteredRooms = [];

        if (floorNumber.startsWith("G-")) {
          // Girls hostel specific floor (like G-1, G-2, etc.)
          const floor = floorNumber.split("-")[1]; // e.g., "1"
          filteredRooms = allRooms.filter((room) =>
            room.roomNumber?.startsWith(`G-${floor}`)
          );
        } else if (["A", "B"].includes(floorNumber)) {
          // Annexure I or II (no floor division)
          filteredRooms = allRooms.filter((room) =>
            room.roomNumber?.startsWith(`${floorNumber}-`)
          );
        } else if (!isNaN(floorNumber)) {
          // Boys Hostel floor
          filteredRooms = allRooms.filter((room) => {
            const roomNum = room.roomNumber;
            return (
              /^\d+$/.test(roomNum) &&
              Math.floor(parseInt(roomNum) / 100) === parseInt(floorNumber)
            );
          });
        }

        setRooms(filteredRooms);
        // showSuccessToast('Rooms Fetched successfully!');
      } catch (error) {
        // showErrorToast('Error fetching rooms !');
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [floorNumber]);

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;

    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/students/${studentId}`);
      setRooms((prevRooms) =>
        prevRooms.map((room) => ({
          ...room,
          students: room.students.filter(
            (student) => student._id !== studentId
          ),
        }))
      );
      toast.success("Student deleted successfully");
      closeModal();
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMoveModal = async (student) => {
    setIsVacantLoading(true);
    setStudentToMove(student);
    setSelectedRoomForMove("");

    try {
      const response = await axios.get("http://localhost:5000/api/rooms");
      const allRooms = response.data;

      // const available = allRooms.filter(
      //   (room) =>
      //     room.students.length < 2 && room.roomNumber !== student.roomNumber
      // );

      const isGirl = student.roomNumber.startsWith("G");

      const available = allRooms.filter((room) => {
        const roomNum = room.roomNumber;
        const isSameRoom = roomNum === student.roomNumber;
        if (isSameRoom || room.students.length >= 2) return false;

        if (isGirl) {
          return roomNum.startsWith("G");
        } else {
          return (
            /^\d+$/.test(roomNum) || // Boys hostel
            roomNum.startsWith("A-") || // Annexure I
            roomNum.startsWith("B-") // Annexure II
          );
        }
      });

      setVacantRooms(available);
      setIsMoveModalOpen(true);
    } catch (err) {
      console.error("Error fetching rooms for move:", err);
      toast.error("Failed to load vacant rooms.");
    } finally {
      setIsVacantLoading(false); // Stop loader
    }
  };

  const handleMoveConfirm = async () => {
    if (!selectedRoomForMove) {
      alert("Please select a vacant room");
      return;
    }

    console.log(selectedRoomForMove);

    try {
      await axios.put(
        `http://localhost:5000/api/students/move/${studentToMove._id}`,
        {
          newRoomNumber: selectedRoomForMove,
        }
      );

      // Refresh room data
      const response = await axios.get("http://localhost:5000/api/rooms");
      const allRooms = response.data;
      const filtered = allRooms.filter(
        (room) => Math.floor(room.roomNumber / 100) === parseInt(floorNumber)
      );
      setRooms(filtered);

      setIsMoveModalOpen(false);
      setStudentToMove(null);
    } catch (err) {
      console.error("Move failed:", err);
      alert("Couldn't move student.");
    }
  };

  const handleOpenSwapModal = async () => {
    setIsVacantLoading(true);
    setSelectedSwapRoom("");
    setSwapCandidates([]);
    setStudentToSwapWith(null);

    try {
      const response = await axios.get("http://localhost:5000/api/rooms");
      const allRooms = response.data;

      const isGirl = studentToMove.roomNumber.startsWith("G");

      const eligible = allRooms.filter((room) => {
        const roomNum = room.roomNumber;
        if (
          room.students.length === 0 ||
          roomNum === studentToMove.roomNumber
        ) {
          return false;
        }

        if (isGirl) {
          return roomNum.startsWith("G");
        } else {
          return (
            /^\d+$/.test(roomNum) ||
            roomNum.startsWith("A-") ||
            roomNum.startsWith("B-")
          );
        }
      });

      setEligibleSwapRooms(eligible);
      setIsSwapModalOpen(true);
    } catch (error) {
      toast.error("Failed to load swap rooms.");
      console.error("Error fetching swap rooms:", error);
    } finally {
      setIsVacantLoading(false);
    }
  };

  const handleSwapConfirm = async () => {
    if (!studentToSwapWith) {
      toast.warning("Please select a student to swap with.");
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/students/swap`, {
        studentAId: studentToMove._id,
        studentBId: studentToSwapWith._id,
      });

      toast.success("Students swapped successfully!");

      // Refresh room data
      const response = await axios.get("http://localhost:5000/api/rooms");
      const filtered = response.data.filter(
        (room) => Math.floor(room.roomNumber / 100) === parseInt(floorNumber)
      );
      setRooms(filtered);

      setIsSwapModalOpen(false);
      setIsMoveModalOpen(false);
      setStudentToMove(null);
    } catch (err) {
      console.error("Swap failed:", err);
      toast.error("Couldn't swap students.");
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        closeModal();
        setIsMoveModalOpen(false);
      }
    };

    if (isModalOpen || isMoveModalOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "auto";
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen, isMoveModalOpen]);

  return (
    <div className="floor-plan-container">
      {loading && (
        <div className="loader-overlay">
          <Spin tip="Loading..." size="large" />
        </div>
      )}
      <div className="floor-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiArrowLeft size={24} />
        </button>
        <h1 className="floor-title">
          {floorNumber === "0" ? "Ground Floor" : `Floor ${floorNumber}`}
        </h1>
      </div>

      <div className="rooms-grid">
        {rooms.map((room) => (
          <div
            key={room.roomNumber}
            className={`room ${room.students.length ? "occupied" : "vacant"}`}
          >
            <div className="room-header">
              <h3>Room {room.roomNumber}</h3>
              <span className="room-status">
                {room.students.length === 2 ? "Occupied" : "Vacant"}
              </span>
            </div>
            <div className="students">
              {room.students.map((student) => (
                // <div key={student._id} className="student-name">
                //   <div onClick={() => handleStudentClick(student)}>
                //     <FiUser className="student-icon" />
                //     <span>{student.name}</span>
                //   </div>
                //   <FiRepeat
                //     className="move-icon"
                //     title="Move Student"
                //     onClick={() => handleOpenMoveModal(student)}
                //     style={{
                //       cursor: "pointer",
                //       marginLeft: "8px",
                //       color: "#007bff",
                //     }}
                //   />
                // </div>
                <div key={student._id} className="student-name">
                  <div
                    className="student-name-content"
                    onClick={() => handleStudentClick(student)}
                  >
                    <FiUser className="student-icon" />
                    <span className="student-name-text">{student.name}</span>
                  </div>
                  {isAdmin && (
                    <div
                      className="move-icon-wrapper"
                      onClick={() => handleOpenMoveModal(student)}
                    >
                      <LuShuffle className="move-icon" size={18} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Student Details Modal */}
      {isVacantLoading && (
        <div className="loader-overlay">
          <Spin tip="Loading ..." size="large" />
        </div>
      )}
      {isModalOpen && selectedStudent && (
        <div className="modal-overlay">
          <div className="student-modal" ref={modalRef}>
            <div className="modal-header">
              <h3>Student Details</h3>
              <button className="close-modal" onClick={closeModal}>
                <FiX size={20} />
              </button>
            </div>
            <div className="student-details">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span>{selectedStudent.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Roll Number:</span>
                <span>{selectedStudent.rollNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span>{selectedStudent.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span>{selectedStudent.mobileNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Room:</span>
                <span>{selectedStudent.roomNumber}</span>
              </div>
            </div>

            {isAdmin && (
              <button
                className="delete-student-btn"
                onClick={() => handleDeleteStudent(selectedStudent._id)}
              >
                Delete this student
              </button>
            )}
          </div>
        </div>
      )}

      {/* Move Student Modal */}
      {isMoveModalOpen && studentToMove && (
        <div className="modal-overlay">
          <div className="student-modal" ref={modalRef}>
            <div className="modal-header">
              <h3>Move Student</h3>
              <button
                className="close-modal"
                onClick={() => setIsMoveModalOpen(false)}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="move-student-row">
              <span className="student-name-display">{studentToMove.name}</span>
              <FiRepeat size={24} style={{ margin: "0 10px", color: "#333" }} />
              <select
                value={selectedRoomForMove}
                onChange={(e) => setSelectedRoomForMove(e.target.value)}
              >
                <option value="">Select vacant room</option>
                {vacantRooms.map((room) => (
                  <option key={room.roomNumber} value={room.roomNumber}>
                    Room {room.roomNumber}
                  </option>
                ))}
              </select>
            </div>

            <button className="confirm-move-btn" onClick={handleMoveConfirm}>
              Confirm Move
            </button>
            <div className="swap-option">
              <p>Want to swap this student?</p>
              <button
                className="swap-student-btn"
                onClick={handleOpenSwapModal}
              >
                Swap Student
              </button>
            </div>
          </div>
        </div>
      )}

      {isSwapModalOpen && (
        <div className="modal-overlay">
          <div className="student-modal" ref={modalRef}>
            <div className="modal-header">
              <h3>Swap Student</h3>
              <button
                className="close-modal"
                onClick={() => setIsSwapModalOpen(false)}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="swap-section">
              <p>Select a room to swap with:</p>
              <select
                value={selectedSwapRoom}
                onChange={(e) => {
                  const roomNumber = e.target.value;
                  setSelectedSwapRoom(roomNumber);
                  const room = eligibleSwapRooms.find(
                    (room) => room.roomNumber.toString() === roomNumber
                  );
                  setSwapCandidates(room?.students || []);
                }}
              >
                <option value="">Select occupied room</option>
                {eligibleSwapRooms.map((room) => (
                  <option key={room.roomNumber} value={room.roomNumber}>
                    Room {room.roomNumber}
                  </option>
                ))}
              </select>
            </div>

            {swapCandidates.length > 0 && (
              <div className="swap-candidates">
                <p>Select a student:</p>
                {swapCandidates.map((student) => (
                  <div
                    key={student._id}
                    className={`swap-student-option ${
                      studentToSwapWith?._id === student._id ? "selected" : ""
                    }`}
                    onClick={() => setStudentToSwapWith(student)}
                  >
                    <FiUser size={18} style={{ marginRight: "6px" }} />
                    {student.name}
                  </div>
                ))}
              </div>
            )}

            <button className="confirm-move-btn" onClick={handleSwapConfirm}>
              Confirm Swap
            </button>
          </div>
        </div>
      )}

      {/* <ToastContainer position="top-right" autoClose={3000} hideProgressBar /> */}
      <ToastContainer
              position="top-center"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnHover
              draggable
              theme="colored"
              toastStyle={{
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            />
    </div>
  );
};

export default FloorPlan;
