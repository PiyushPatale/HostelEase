const express = require("express");
const router = express.Router();
const Student = require("../models/User");
const Room = require("../models/Room");
const User = require("../models/User");

// Delete a student
router.delete("/:id", async (req, res) => {

  console.log("DELETE /api/students/:id route hit!");
  try {
    const studentId = req.params.id;
    
    if (!studentId) {
      console.error("No studentId provided!");
      return;
    }
    // Find the student
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Remove the student from their room
    await Room.updateOne(
      { roomNumber: student.roomNumber },
      { $pull: { students: studentId } }
    );

    // Delete the student from the database
    await Student.findByIdAndDelete(studentId);
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/move/:studentId", (req, res, next) => {
  // console.log("Route hit! studentId:", req.params.studentId);
  next();
});

router.put("/move/:studentId", async (req, res) => {
  const { studentId } = req.params;
  const { newRoomNumber } = req.body;

  try {
    // Step 1: Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Step 2: Normalize room numbers - critical step
    const targetRoom = String(newRoomNumber).trim();
    const currentRoom = String(student.roomNumber).trim();

    // console.log(`Searching for room: "${targetRoom}"`);

    // Step 3: Find the rooms using exhaustive search
    const allRooms = await Room.find({});
    const newRoom = allRooms.find(
      (room) => String(room.roomNumber).trim() === targetRoom
    );

    const oldRoom = allRooms.find(
      (room) => String(room.roomNumber).trim() === currentRoom
    );

    // console.log(
    //   "All rooms:",
    //   allRooms.map((r) => r.roomNumber)
    // );
    // console.log("Found new room:", newRoom ? newRoom.roomNumber : "NOT FOUND");

    if (!newRoom) {
      // Advanced diagnostics
      const similarRooms = allRooms.filter((room) =>
        String(room.roomNumber).trim().includes(targetRoom)
      );

      return res.status(404).json({
        message: "Target room not found",
        requestedRoom: targetRoom,
        availableRooms: allRooms.map((r) => r.roomNumber),
        similarRooms: similarRooms.map((r) => r.roomNumber),
      });
    }

    if (newRoom.students.length >= 2) {
      return res.status(400).json({ message: "Target room is already full" });
    }

    // Step 4: Remove student from old room (if exists)
    if (oldRoom) {
      oldRoom.students = oldRoom.students.filter(
        (id) => id.toString() !== studentId
      );
      await oldRoom.save();
    }

    // Step 5: Update student record
    student.roomNumber = targetRoom;
    await student.save();

    // Step 6: Add to new room
    if (!newRoom.students.includes(student._id)) {
      newRoom.students.push(student._id);
      await newRoom.save();
    }

    return res.status(200).json({
      message: "Student moved successfully",
      oldRoom: currentRoom,
      newRoom: targetRoom,
    });
  } catch (error) {
    console.error("Move error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});


router.put("/swap", async (req, res) => {
  const { studentAId, studentBId } = req.body;

  try {
    // Find students
    const studentA = await Student.findById(studentAId);
    const studentB = await Student.findById(studentBId);

    if (!studentA || !studentB) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Normalize room numbers
    const roomANumber = String(studentA.roomNumber).trim();
    const roomBNumber = String(studentB.roomNumber).trim();

    // console.log(`Student A Room: ${roomANumber}`);
    // console.log(`Student B Room: ${roomBNumber}`);

    // Find ALL rooms first
    const allRooms = await Room.find({});
    // console.log(
    //   "All rooms:",
    //   allRooms.map((r) => r.roomNumber)
    // );

    // Find rooms using in-memory search
    const roomA = allRooms.find(
      (r) => String(r.roomNumber).trim() === roomANumber
    );
    const roomB = allRooms.find(
      (r) => String(r.roomNumber).trim() === roomBNumber
    );

    // console.log("Found roomA:", roomA ? roomA.roomNumber : "NOT FOUND");
    // console.log("Found roomB:", roomB ? roomB.roomNumber : "NOT FOUND");

    if (!roomA || !roomB) {
      return res.status(404).json({
        error: "Room not found",
        details: {
          requestedRooms: {
            roomA: roomANumber,
            roomB: roomBNumber,
          },
          availableRooms: allRooms.map((r) => r.roomNumber),
        },
      });
    }

    // Step 1: Swap room numbers
    const tempRoom = studentA.roomNumber;
    studentA.roomNumber = studentB.roomNumber;
    studentB.roomNumber = tempRoom;

    // Step 2: Update rooms
    roomA.students = roomA.students.filter(
      (id) => id.toString() !== studentA._id.toString()
    );
    roomB.students = roomB.students.filter(
      (id) => id.toString() !== studentB._id.toString()
    );

    roomA.students.push(studentB._id);
    roomB.students.push(studentA._id);

    // Save all changes
    await Promise.all([
      studentA.save(),
      studentB.save(),
      roomA.save(),
      roomB.save(),
    ]);

    res.status(200).json({ message: "Students swapped successfully" });
  } catch (err) {
    console.error("Error swapping students:", err);
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
});

router.get("/yearwise/:year", async (req, res) => {
  try {
    const { year } = req.params;
    // console.log(year);
    

    // Validate year format (must be two digits)
    if (!/^\d{2}$/.test(year)) {
      return res.status(400).json({ message: "Invalid year format. Use '21', '22', etc." });
    }

    const students = await User.find({
      rollNumber: { $regex: `^${year}` } // Starts with the year
    }).select("name email rollNumber roomNumber mobileNumber");

    if (students.length === 0) {
      return res.status(404).json({ message: `No students found for year ${year}` });
    }

    res.status(200).json({
      year: `20${year}`,
      total: students.length,
      students
    });
  } catch (error) {
    console.error("Error fetching yearwise students:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get students not allotted to any room
// router.get("/unallotted", async (req, res) => {
//   try {
//     // Fetch all student IDs that are allotted (present in room.students arrays)
//     const rooms = await Room.find({}, "students");
//     const allottedIds = rooms.flatMap(room => room.students.map(id => id.toString()));

//     // Find users who are students (not admin) and not in any room
//     const unallottedStudents = await User.find({
//       isAdmin: { $ne: true },
//       _id: { $nin: allottedIds }
//     }).select("-password"); // Exclude password field for safety

//     res.status(200).json(unallottedStudents);
//   } catch (error) {
//     console.error("Error fetching unallotted students:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.get("/unallotted", async (req, res) => {
  try {
    // Step 1: Get all user IDs currently allotted to rooms
    const rooms = await Room.find({}, "students");
    const allottedUserIds = new Set(
      rooms.flatMap(room => room.students.map(id => id.toString()))
    );

    // Step 2: Find students not in any room
    const unallottedStudents = await User.find({
      isAdmin: { $ne: true },
      _id: { $nin: Array.from(allottedUserIds) }
    }).select("-password");

    res.status(200).json(unallottedStudents);
  } catch (error) {
    console.error("Error fetching unallotted students:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
