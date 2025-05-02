import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

const { PUBLIC_SERVER_URL } = require("./api");

const host = PUBLIC_SERVER_URL;

const RoomChangeRequests = ({ adminType }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        let endpoint = '/api/room/requests';
        if (adminType === 'boys') endpoint = '/api/room/requests/boys';
        if (adminType === 'girls') endpoint = '/api/room/requests/girls';

        const response = await axios.get(`${host}${endpoint}`);
        // console.log(response.data.requests);
        
        setRequests(response.data.requests);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [adminType]);

  const handleStatusChange = async (id, status) => {
    try {
      const response = await axios.put(`${host}/api/room/requests/${id}`, { status });
      setRequests(requests.map(req => 
        req._id === id ? response.data.request : req
      ));
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  if (loading) return <div className="loading-spinner"><FaSpinner className="spin" /></div>;

  return (
    <div className="requests-container">
      <h2>Room Change Requests</h2>
      {requests.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        <table className="requests-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll No</th>
              <th>Current Room</th>
              <th>Requested Room</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(request => (
              <tr key={request._id}>
                <td>{request.user?.name || 'N/A'}</td>
                <td>{request.user?.rollNumber || 'N/A'}</td>
                <td>{request.currentRoom}</td>
                <td>{request.requestedRoom}</td>
                <td>{request.reason}</td>
                <td className={`status ${request.status}`}>
                  {request.status}
                </td>
                <td className="actions">
                  {request.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleStatusChange(request._id, 'approved')}
                        className="approve-btn"
                      >
                        <FaCheck /> Approve
                      </button>
                      <button 
                        onClick={() => handleStatusChange(request._id, 'rejected')}
                        className="reject-btn"
                      >
                        <FaTimes /> Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RoomChangeRequests;