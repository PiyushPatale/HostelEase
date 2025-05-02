const express = require("express");
const router = express.Router();
const RoomChangeRequest = require("../models/RoomChangeRequest");
const User = require("../models/User");
const { default: mongoose } = require("mongoose");

// POST: Student submits room change request
// router.post("/request-room-change", async (req, res) => {
//     try {
//       const { studentId, currentRoom, requestedRoom, reason } = req.body;

//       if (!currentRoom || !requestedRoom || !reason) {
//         return res.status(400).json({ message: "All fields are required" });
//       }

//       const newRequest = new RoomChangeRequest({
//         student: studentId,  // Now using student reference
//         currentRoom,
//         requestedRoom,
//         reason,
//       });

//       await newRequest.save();

//       res.status(201).json({ message: "Request submitted", request: newRequest });
//     } catch (error) {
//       console.error("Error submitting request:", error);
//       res.status(500).json({
//         message: "Server Error",
//         error: error.message,
//         stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//       });
//     }
//   });

router.post("/request-room-change", async (req, res) => {
  try {
    // console.log("Received request body:", req.body);
    const { userId, currentRoom, requestedRoom, reason } = req.body;

    if (!userId || !currentRoom || !requestedRoom || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newRequest = new RoomChangeRequest({
      user : userId, // This should be the student's ObjectId
      currentRoom,
      requestedRoom,
      reason,
    });

    await newRequest.save();

    const populatedRequest = await RoomChangeRequest.findById(newRequest._id)
      .populate('user', 'name email rollNumber roomNumber');

    res.status(201).json({
      message: "Request submitted",
      request: populatedRequest
    });
  } catch (error) {
    console.error("Error submitting request:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
});

// In your roomChangeRoutes.js
router.delete("/request/:id", async (req, res) => {
  // console.log(req.params.id);
  
  try {
    const deletedRequest = await RoomChangeRequest.findByIdAndDelete(req.params.id);
    
    if (!deletedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }
    
    res.json({ message: "Request cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// GET: Get request by student roll number  
router.get("/student/:userId", async (req, res) => {
    // console.log(req.params.userId);
    
    try {
      // First verify the user exists
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Find request by user reference
      const request = await RoomChangeRequest.findOne({
        user: req.params.userId
      }).populate('user', 'name rollNumber roomNumber');

      // console.log(request);
      
  
      if (!request) {
        return res.status(404).json({ message: "No request found for this user" });
      }
  
      res.json({ request });
    } catch (error) {
      console.error("Error fetching request:", error);
      res.status(500).json({ 
        message: "Server Error", 
        error: error.message 
      });
    }
  });

router.get("/requests", async (req, res) => {
  try {
    const requests = await RoomChangeRequest.find().populate(
      "user",
      "name rollNumber roomNumber"
    );
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

router.get("/requests/boys", async (req, res) => {
  try {
    const requests = await RoomChangeRequest.find({
      currentRoom: { $not: /^G-/ }, // Rooms not starting with G (girls)
    }).populate("user", "name rollNumber roomNumber");
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

router.get("/requests/girls", async (req, res) => {
  try {
    const requests = await RoomChangeRequest.find({
      currentRoom: /^G-/, // Rooms starting with G (girls)
    }).populate("user", "name rollNumber roomNumber");
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

router.put("/requests/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const request = await RoomChangeRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user", "name rollNumber roomNumber");

    res.json({ request });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

router.get("/student-requests/:userId", async (req, res) => {
  try {
    const requests = await RoomChangeRequest.find({ 
      user: req.params.userId 
    }).sort({ createdAt: -1 }).populate('user', 'name rollNumber roomNumber');
    
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Check for pending requests
router.get("/has-pending/:userId", async (req, res) => {
  try {
    const pendingRequest = await RoomChangeRequest.findOne({
      user: req.params.userId,
      status: "pending"
    });
    
    res.json({ hasPending: !!pendingRequest });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
