const Room = require("../models/Room");
const User = require("../models/User");

exports.createRoom = async (req, res) => {
  try {
    const rooms = req.body; // Expecting an array of { roomNumber }

    if (!Array.isArray(rooms)) {
      return res.status(400).json({ message: "Invalid data format. Expected an array." });
    }

    const createdRooms = [];
    for (let roomData of rooms) {
      const { roomNumber } = roomData;

      if (!roomNumber) continue;

      const roomExists = await Room.findOne({ roomNumber: roomNumber.toString() });
      if (roomExists) {
        console.log(`Room ${roomNumber} already exists. Skipping.`);
        continue;
      }

      const newRoom = new Room({ roomNumber: roomNumber.toString() });
      await newRoom.save();
      createdRooms.push(newRoom);
    }

    res.status(201).json({ message: "Rooms created successfully", rooms: createdRooms });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("students", "name rollNumber email mobileNumber roomNumber");
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Assign student to a room
exports.assignStudent = async (req, res) => {
  try {
    const { roomNumber, rollNumber } = req.body;
    console.log(roomNumber.toString());
    // const room = await Room.findOne({ roomNumber: roomNumber.toString() });
    const allRooms = await Room.find({});
    const room = allRooms.find(
      (r) => String(r.roomNumber).trim().toUpperCase()
    );
    console.log(room);
    

    if (!room) return res.status(404).json({ message: "Room not found" });

    const student = await User.findOne({ rollNumber });
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (room.students.length >= 2)
      return res.status(400).json({ message: "Room is full" });

    if (!student._id) {
      return res.status(500).json({ message: "Student ID is missing!" });
    }

    room.students.push(student._id);
    await room.save();
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove student from a room
exports.removeStudent = async (req, res) => {
  try {
    const { roomNumber, rollNumber } = req.body;
    const room = await Room.findOne({ roomNumber: roomNumber.toString() });

    if (!room) return res.status(404).json({ message: "Room not found" });

    const student = await User.findOne({ rollNumber });
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (!room.students.includes(student._id)) {
      return res.status(400).json({ message: "Student is not assigned to this room" });
    }

    room.students = room.students.filter(id => id.toString() !== student._id.toString());
    await room.save();
    res.json({ message: "Student removed successfully", room });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all vacant rooms
exports.getVacantRooms = async (req, res) => {
  try {
    const vacantRooms = await Room.find({ status: "Vacant" });
    res.json(vacantRooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all occupied rooms
// exports.getOccupiedRooms = async (req, res) => {
//   try {
//     const occupiedRooms = await Room.find({ students: { $ne: [] } }).populate("students", "name rollNumber");

//     if (occupiedRooms.length === 0) {
//       return res.status(404).json({ message: "No occupied rooms found" });
//     }

//     res.json(occupiedRooms);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
exports.getOccupiedRooms = async (req, res) => {
  try {
    const occupiedRooms = await Room.find({
      $expr: { $eq: [{ $size: "$students" }, 2] }
    }).populate("students", "name rollNumber");

    if (occupiedRooms.length === 0) {
      return res.status(404).json({ message: "No occupied rooms found" });
    }

    res.json(occupiedRooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
