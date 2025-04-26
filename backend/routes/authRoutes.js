const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Room = require("../models/Room");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const JWT_SECRET = "secretkey";

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// upload = multer({ storage: storage });
const upload = multer({ storage });


router.post("/signup", async (req, res) => {
  try {
    let students = Array.isArray(req.body) ? req.body : [req.body];
    let addedStudents = [];
    let errors = [];

    for (let student of students) {
      const { name, email, password, roomNumber, mobileNumber, rollNumber } =
        student;

      // Validate email format
      if (!email.endsWith("@iiitg.ac.in")) {
        errors.push({ name, email, message: "Invalid email format" });
        continue;
      }

      // Check if user already exists
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        errors.push({ name, email, message: "User already exists" });
        continue;
      }

      let room = null;

      // If roomNumber is provided, normalize and validate
      if (roomNumber) {
        let normalizedRoomNumber = String(roomNumber).trim().toUpperCase();

        // Convert A101 → A-101
        if (/^[A-Z]\d+$/.test(normalizedRoomNumber)) {
          normalizedRoomNumber = normalizedRoomNumber.replace(
            /([A-Z])(\d+)/,
            "$1-$2"
          );
        }

        const allRooms = await Room.find({});
        room = allRooms.find(
          (r) =>
            String(r.roomNumber).trim().toUpperCase() === normalizedRoomNumber
        );

        if (!room) {
          const availableRooms = await Room.find({
            $or: [
              { status: "Vacant" },
              { $expr: { $lt: [{ $size: "$students" }, 2] } },
            ],
          });

          errors.push({
            name,
            providedRoomNumber: roomNumber,
            normalizedRoomNumber,
            message: `Room does not exist. Available rooms: ${availableRooms
              .map((r) => r.roomNumber)
              .join(", ")}`,
          });
          continue;
        }

        if (room.students.length >= 2) {
          errors.push({
            name,
            roomNumber: room.roomNumber,
            message: `Room ${room.roomNumber} is full (2/2 occupants)`,
          });
          continue;
        }
      }

      // Create user
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        roomNumber: room ? room.roomNumber : null, // null if no room provided
        mobileNumber,
        rollNumber,
      });

      await newUser.save();

      // Add user to room if applicable
      if (room) {
        room.students.push(newUser._id);
        await room.save();
      }

      addedStudents.push({
        name,
        email,
        roomNumber: room ? room.roomNumber : "Not Assigned",
      });
    }

    // Final response
    if (addedStudents.length === 0 && errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "No students were added",
        errors,
      });
    }

    res.status(201).json({
      success: true,
      message:
        addedStudents.length === students.length
          ? "All students added successfully"
          : "Partial success - some students added",
      addedStudents,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

router.post("/signup-csv", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      const addedStudents = [];
      const errors = [];

      for (const student of results) {
        const { name, email, password, roomNumber, mobileNumber, rollNumber } = student;

        try {
          if (!email.endsWith("@iiitg.ac.in")) {
            errors.push({ name, email, message: "Invalid email format" });
            continue;
          }

          let existingUser = await User.findOne({ email });
          if (existingUser) {
            errors.push({ name, email, message: "User already exists" });
            continue;
          }

          let room = null;
          if (roomNumber) {
            let normalizedRoomNumber = String(roomNumber).trim().toUpperCase();
            if (/^[A-Z]\d+$/.test(normalizedRoomNumber)) {
              normalizedRoomNumber = normalizedRoomNumber.replace(/([A-Z])(\d+)/, "$1-$2");
            }

            const allRooms = await Room.find({});
            room = allRooms.find(r => String(r.roomNumber).trim().toUpperCase() === normalizedRoomNumber);

            if (!room) {
              errors.push({
                name,
                roomNumber,
                message: `Room ${roomNumber} does not exist`,
              });
              continue;
            }

            if (room.students.length >= 2) {
              errors.push({
                name,
                roomNumber,
                message: `Room ${roomNumber} is full`,
              });
              continue;
            }
          }

          const hashedPassword = await bcrypt.hash(password, 10);

          const newUser = new User({
            name,
            email,
            password: hashedPassword,
            roomNumber: room ? room.roomNumber : undefined,
            mobileNumber,
            rollNumber,
          });

          await newUser.save();

          if (room) {
            room.students.push(newUser._id);
            await room.save();
          }

          addedStudents.push({ name, email });
        } catch (err) {
          console.error("Error adding student:", student, err);
          errors.push({ name, email, message: "Unexpected server error" });
        }
      }

      // Delete uploaded file after processing
      fs.unlink(filePath, () => {});

      res.status(200).json({
        message: "CSV Processed",
        addedStudents,
        errors,
      });
    });
});

router.post("/login", async (req, res) => {
  // console.log("Received Login Request:", req.body);
  const { email, password } = req.body;

  if (!email.endsWith("@iiitg.ac.in")) {
    return res
      .status(400)
      .json({ message: "Only @iiitg.ac.in emails are allowed" });
  }

  try {
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const adminToken = jwt.sign({ role: "admin" }, JWT_SECRET, {
        expiresIn: "24h",
      });

      return res.json({
        user: {
          email: "admin@iiitg.ac.in",
          role: "admin",
        },
        token: adminToken,
        redirectTo: "/adminprofile",
      });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    const token = jwt.sign(
      { id: user._id, role: user.isAdmin ? "admin" : "user" },
      JWT_SECRET,
      { expiresIn: "5h" }
    );
    // console.log(token);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roomNumber: user.roomNumber,
        mobileNumber: user.mobileNumber,
        rollNumber: user.rollNumber,
        role: user.isAdmin ? "admin" : "user",
      },
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
