import { useState, useEffect } from "react";
import "../styles/dashboard.css";
import { FiArrowLeft } from "react-icons/fi";
import { Navigate } from "react-router-dom";

const { PUBLIC_SERVER_URL } = require("./api");

const host=PUBLIC_SERVER_URL

const Dashboard = () => {
  const [showStudents, setShowStudents] = useState(false);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState(""); // For year filter

  const studentsPerPage = 10;

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

    if (selectedYear) {
      filtered = filtered.filter(
        (student) =>
          student.rollNumber && student.rollNumber.startsWith(selectedYear)
      );
    }

    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedYear, students]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.roomNumber &&
            student.roomNumber.toString().includes(searchTerm))
      );
      setFilteredStudents(filtered);
      setCurrentPage(1);
    } else {
      setFilteredStudents(students);
    }
  }, [searchTerm, students]);

  const handleViewStudents = () => {
    if (!showStudents) {
      fetchStudents();
    }
    setShowStudents(!showStudents);
  };

  // Pagination logic
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
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await fetch(`${host}api/auth/signup-csv`, {
        method: "POST",
        body: formData,
      });
  
      const text = await response.text();
  
      try {
        const result = JSON.parse(text);
        if (response.ok) {
          alert("CSV uploaded successfully ✅");
          fetchStudents();
        } else {
          alert("CSV upload failed ❌: " + result.message);
        }
      } catch (e) {
        console.error("Invalid JSON from server:", text);
        alert("Server sent invalid response. Check backend logs.");
      }
    } catch (error) {
      console.error("CSV Upload Error:", error);
      alert("Upload failed. Please try again.");
    }
  };
  

  return (
    <div className="dashboard">
      {/* <button className="back-button" onClick={() => Navigate(-1)}>
        <FiArrowLeft size={24} />
      </button> */}
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
              >
                <option value="">All Years</option>
                <option value="21">2021</option>
                <option value="22">2022</option>
                <option value="23">2023</option>
                <option value="24">2024</option>
              </select>
            </div>

            <div className="students-list">
              <h2>Student Details</h2>
              {loading ? (
                <p>Loading students...</p>
              ) : (
                <>
                  {currentStudents.length > 0 ? (
                    <>
                      <ul>
                        {currentStudents.map((student) => (
                          <li key={student.id}>
                            <strong>{student.name}</strong> - {student.email} -
                            Room: {student.roomNumber || "N/A"}
                          </li>
                        ))}
                      </ul>

                      {/* {filteredStudents.length > studentsPerPage && (
                        <div className="pagination">
                          <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="pagination-button"
                          >
                            &laquo; Prev
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => (
                            <button
                              key={i}
                              onClick={() => paginate(i + 1)}
                              className={`pagination-button ${
                                currentPage === i + 1 ? "active" : ""
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                          <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="pagination-button"
                          >
                            Next &raquo;
                          </button>
                        </div>
                      )} */}
                      {filteredStudents.length > studentsPerPage && (
                        <div className="pagination">
                          <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="pagination-button pagination-nav"
                            title="Previous page"
                          >
                            Previous
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
      {/* Floating CSV Upload Button */}
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
    </div>
  );
};

export default Dashboard;
