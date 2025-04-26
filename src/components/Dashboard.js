import { useState, useEffect } from "react";
import "../styles/dashboard.css";
import toast, { Toaster } from 'react-hot-toast';
const { PUBLIC_SERVER_URL } = require("./api");
const host = PUBLIC_SERVER_URL;

const Dashboard = () => {
  const [showStudents, setShowStudents] = useState(false);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState("");
  const [showUnallotted, setShowUnallotted] = useState(false);
  const [vacantRooms, setVacantRooms] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [roomAssignModal, setRoomAssignModal] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [parsingStatus, setParsingStatus] = useState("Parsing CSV...");
  const [errorData, setErrorData] = useState(null);

  const studentsPerPage = 10;
  const token = localStorage.getItem("token");

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${host}/api/users`);
      const data = await response.json();
      const filteredStudents = data.filter((user) => !user.isAdmin);
      setStudents(filteredStudents);
      setFilteredStudents(filteredStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
    setLoading(false);
  };

  const fetchVacantRooms = async () => {
    try {
      const response = await fetch(`${host}/api/rooms/vacant`);
      const data = await response.json();
      setVacantRooms(data);
    } catch (err) {
      console.error("Failed to fetch vacant rooms:", err);
    }
  };

  const handleAssignRoom = async () => {
    setLoading(true);
    if (!selectedStudent || !selectedStudent.selectedRoom) return;

    try {
      const response = await fetch(`${host}/api/rooms/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rollNumber: selectedStudent.rollNumber,
          roomNumber: selectedStudent.selectedRoom,
        }),
      });

      if (response.ok) {
        setRoomAssignModal(false);
        fetchUnallottedStudents(); // refresh unallotted list
        toast.success(`Student ${selectedStudent.name} assigned to room ${selectedStudent.roomNumber} successfully!`);
      } else {
        // const data = await response.json();
        // alert(data.message || "Failed to assign room");
        toast.error("Failed to Assign Room")
      }
    } catch (error) {
      console.error("Error assigning room:", error);
    }
    setLoading(false);
  };

  const fetchUnallottedStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${host}/api/students/unallotted`);
      const data = await response.json();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error("Error fetching unallotted students:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    let filtered = students;
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.roomNumber &&
            student.roomNumber.toString().includes(searchTerm))
      );
    }

    if (!showUnallotted && selectedYear) {
      filtered = filtered.filter(
        (student) =>
          student.rollNumber && student.rollNumber.startsWith(selectedYear)
      );
    }

    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedYear, students, showUnallotted]);

  const handleViewStudents = () => {
    if (!showStudents) {
      showUnallotted ? fetchUnallottedStudents() : fetchStudents();
    }
    setShowStudents(!showStudents);
  };

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setShowModal(true);
    setParsingStatus("Parsing CSV...");
    setErrorData(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${host}/api/auth/signup-csv`, {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      try {
        const result = JSON.parse(text);

        if (response.ok) {
          if (result.errors && result.errors.length > 0) {
            setParsingStatus("Some rows failed validation.");
            setErrorData(result.errors);
          } else {
            setParsingStatus("CSV uploaded successfully ✅");
          }
          fetchStudents();
        } else {
          setParsingStatus("Upload failed: " + result.message);
        }
      } catch (e) {
        console.error("Invalid JSON from server:", text);
        setParsingStatus("Server returned invalid JSON.");
      }
    } catch (error) {
      console.error("CSV Upload Error:", error);
      setParsingStatus("Upload failed. Please try again.");
    }
  };

  const generateErrorCSV = (errors) => {
    let csv = "Row No,Name,Email,Error Message\n";
    errors.forEach((err, index) => {
      csv += `${index + 1},"${err.name}","${err.email}","${err.message}"\n`;
    });
    return csv;
  };

  return (
    <div className="dashboard">
      <Toaster position="top-center" reverseOrder={false} /> 
      <div className="dashboard-content">
        <h1>Admin Dashboard</h1>
        <button className="button" onClick={handleViewStudents}>
          {showStudents ? "Hide Students" : "View Students"}
        </button>

        {showStudents && (
          <div className="students-container">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by name, email, or room number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="year-filter"
                disabled={showUnallotted}
              >
                <option value="">All Years</option>
                <option value="21">2021</option>
                <option value="22">2022</option>
                <option value="23">2023</option>
                <option value="24">2024</option>
              </select>

              <label className="unallotted-filter">
                <input
                  type="checkbox"
                  checked={showUnallotted}
                  onChange={(e) => {
                    setShowUnallotted(e.target.checked);
                    if (e.target.checked) {
                      fetchUnallottedStudents();
                    } else {
                      fetchStudents();
                    }
                  }}
                />
                Unallotted
              </label>
            </div>

            <div className="students-list">
              <h2>Student Details</h2>
              {loading ? (
                <p className="loading-text">Loading students...</p>
              ) : (
                <>
                  <p className="result-count">
                    {filteredStudents.length} student
                    {filteredStudents.length !== 1 ? "s" : ""} found.
                  </p>
                  {currentStudents.length > 0 ? (
                    <>
                      <ul>
                        {currentStudents.map((student) => (
                          <li key={student.id}>
                            <div className="student-info">
                              <strong>{student.name}</strong> -{" "}
                              {student.rollNumber} - {student.email} - Room:{" "}
                              {student.roomNumber || "N/A"}
                            </div>
                            {showUnallotted && (
                              <button
                                className="allocate-button"
                                onClick={() => {
                                  setSelectedStudent({
                                    ...student,
                                    selectedRoom: "",
                                  });
                                  fetchVacantRooms();
                                  setRoomAssignModal(true);
                                }}
                              >
                                Allocate Room
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                      {filteredStudents.length > studentsPerPage && (
                        <div className="pagination">
                          <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="pagination-button pagination-nav"
                            title="Previous page"
                          >
                            Previous
                            {/* Pagination logic unchanged */}
                          </button>
                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => paginate(pageNum)}
                                  className={`pagination-button ${
                                    currentPage === pageNum ? "active" : ""
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            }
                          )}
                          {totalPages > 5 && currentPage < totalPages - 2 && (
                            <>
                              <span className="pagination-ellipsis">...</span>
                              <button
                                onClick={() => paginate(totalPages)}
                                className={`pagination-button ${
                                  currentPage === totalPages ? "active" : ""
                                }`}
                              >
                                {totalPages}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="pagination-button pagination-nav"
                            title="Next page"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p>No students found.</p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {roomAssignModal && (
        <div className="modal-backdrop">
          <div className="room-assign-modal">
            <h3>Assign Room to {selectedStudent.name}</h3>
            <select
              className="room-assign-select"
              value={selectedStudent.selectedRoom}
              onChange={(e) =>
                setSelectedStudent({
                  ...selectedStudent,
                  selectedRoom: e.target.value,
                })
              }
            >
              <option value="">Select a room</option>
              {vacantRooms.map((room) => (
                <option key={room._id} value={room.roomNumber}>
                  {room.roomNumber}
                </option>
              ))}
            </select>

            <div className="modal-actions">
              <button
                onClick={handleAssignRoom}
                className="confirm-btn"
                disabled={!selectedStudent.selectedRoom}
              >
                Assign
              </button>
              <button
                onClick={() => setRoomAssignModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="csv-upload-float">
        <input
          type="file"
          accept=".csv"
          id="csvUpload"
          style={{ display: "none" }}
          onChange={handleCSVUpload}
        />
        <label htmlFor="csvUpload" className="csv-upload-button">
          Upload CSV
        </label>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{parsingStatus}</h3>

            {errorData && errorData.length > 0 && (
              <>
                <p>{errorData.length} row(s) failed:</p>
                <div className="error-table-wrapper">
                  <table className="error-table">
                    <thead>
                      <tr>
                        <th>Row No.</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Error Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {errorData.map((err, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{err.name}</td>
                          <td>{err.email}</td>
                          <td>{err.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <a
                  href={`data:text/csv;charset=utf-8,${encodeURIComponent(
                    generateErrorCSV(errorData)
                  )}`}
                  download="error-rows.csv"
                  className="csv-download-link"
                >
                  Download Error Rows CSV
                </a>
              </>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="close-modal-btn"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
