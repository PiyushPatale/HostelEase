const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Room = require("../models/Room");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const upload = require("../middleware/upload");
// const { Upload } = require("antd");

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

// const Upload = multer({ storage: storage });

// router.post("/signup", async (req, res) => {
//   try {
//     let students = Array.isArray(req.body) ? req.body : [req.body]; // Supports single & bulk signup
//     let addedStudents = [];
//     let errors = [];

//     for (let student of students) {
//       const { name, email, password, roomNumber, mobileNumber, rollNumber } = student;

//       if (!email.endsWith("@iiitg.ac.in")) {
//         errors.push({ name, email, message: "Invalid email format" });
//         continue;
//       }

//       let existingUser = await User.findOne({ email });
//       if (existingUser) {
//         errors.push({ name, email, message: "User already exists" });
//         continue;
//       }

//       let room = await Room.findOne({ roomNumber });

//       if (!room) {
//         errors.push({ name, roomNumber, message: "Room does not exist" });
//         continue;
//       }

//       if (room.students.length >= 2) {
//         errors.push({ name, roomNumber, message: "Room is full" });
//         continue;
//       }

//       const hashedPassword = await bcrypt.hash(password, 10);

//       const newUser = new User({
//         name,
//         email,
//         password: hashedPassword,
//         roomNumber,
//         mobileNumber,
//         rollNumber,
//       });

//       await newUser.save();
//       room.students.push(newUser._id);
//       await room.save();

//       addedStudents.push({ name, email, roomNumber });
//     }

//     if (addedStudents.length === 0) {
//       return res.status(400).json({ message: "No valid students to add", errors });
//     }

//     res.status(201).json({
//       message: "Signup successful for valid students",
//       addedStudents,
//       errors: errors.length > 0 ? errors : undefined,
//     });
//   } catch (error) {
//     console.error("Error in signup:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// });

// router.post("/signup", async (req, res) => {
//   try {
//     let students = Array.isArray(req.body) ? req.body : [req.body];
//     let addedStudents = [];
//     let errors = [];

//     for (let student of students) {
//       const { name, email, password, roomNumber, mobileNumber, rollNumber } = student;

//       // Validate email format
//       if (!email.endsWith("@iiitg.ac.in")) {
//         errors.push({ name, email, message: "Invalid email format" });
//         continue;
//       }

//       // Check if user exists
//       let existingUser = await User.findOne({ email });
//       if (existingUser) {
//         errors.push({ name, email, message: "User already exists" });
//         continue;
//       }

//       let normalizedRoomNumber = String(roomNumber).trim()

//       if (/^[A-Z]\d+$/.test(normalizedRoomNumber)) {
//         normalizedRoomNumber = normalizedRoomNumber.replace(/([A-Z])(\d+)/, '$1-$2');
//       }

//       const allRooms = await Room.find({});
//       // let room = await Room.findOne({
//       //   roomNumber: normalizedRoomNumber
//       // });

//       const room = allRooms.find(
//         (r) => String(r.roomNumber).trim().toUpperCase() === normalizedRoomNumber
//       );

//       if (!room) {
//         const availableRooms = await Room.find({
//           $or: [
//             { status: "Vacant" },
//             { $expr: { $lt: [{ $size: "$students" }, 2] } }
//           ]
//         });

//         errors.push({
//           name,
//           providedRoomNumber: roomNumber,
//           normalizedRoomNumber,
//           message: `Room does not exist. Available rooms: ${availableRooms
//             .map((r) => r.roomNumber)
//             .join(", ")}`
//         });
//         continue;
//       }

//       // Rest of your existing code...
//       if (room.students.length >= 2) {
//         errors.push({
//           name,
//           roomNumber: room.roomNumber,
//           message: `Room ${room.roomNumber} is full (2/2 occupants)`
//         });
//         continue;
//       }

//       // Hash password and create user...
//       const hashedPassword = await bcrypt.hash(password, 10);

//       const newUser = new User({
//         name,
//         email,
//         password: hashedPassword,
//         roomNumber: room.roomNumber, // Use the exact format from DB
//         mobileNumber,
//         rollNumber,
//       });

//       await newUser.save();

//       // Add student to room
//       room.students.push(newUser._id);
//       await room.save();

//       addedStudents.push({
//         name,
//         email,
//         roomNumber: room.roomNumber,
//       });
//     }

//     // Response handling remains the same...
//     if (addedStudents.length === 0 && errors.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No students were added",
//         errors,
//       });
//     }

//     res.status(201).json({
//       success: true,
//       message:
//         addedStudents.length === students.length
//           ? "All students added successfully"
//           : "Partial success - some students added",
//       addedStudents,
//       errors: errors.length > 0 ? errors : undefined,
//     });
//   } catch (error) {
//     console.error("Error in signup:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// });

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

// router.post("/signup-csv", upload.single("file"), async (req, res) => {
//   const filePath = req.file?.path;

//   if (!filePath) {
//     return res.status(400).json({ success: false, message: "CSV file is required" });
//   }

//   const students = [];

//   fs.createReadStream(filePath)
//     .pipe(csv())
//     .on("data", (row) => {
//       students.push(row);
//     })
//     .on("end", async () => {
//       fs.unlinkSync(filePath); // Clean up uploaded file

//       let addedStudents = [];
//       let errors = [];

//       for (let student of students) {
//         try {
//           const { name, email, password, roomNumber, mobileNumber, rollNumber } = student;

//           if (!email.endsWith("@iiitg.ac.in")) {
//             errors.push({ name, email, message: "Invalid email format" });
//             continue;
//           }

//           const existingUser = await User.findOne({ email });
//           if (existingUser) {
//             errors.push({ name, email, message: "User already exists" });
//             continue;
//           }

//           let normalizedRoomNumber = String(roomNumber).trim().toUpperCase();
//           if (/^[A-Z]\d+$/.test(normalizedRoomNumber)) {
//             normalizedRoomNumber = normalizedRoomNumber.replace(/([A-Z])(\d+)/, "$1-$2");
//           }

//           const allRooms = await Room.find({});
//           const room = allRooms.find(
//             (r) => String(r.roomNumber).trim().toUpperCase() === normalizedRoomNumber
//           );

//           if (!room) {
//             errors.push({ name, normalizedRoomNumber, message: `Room not found` });
//             continue;
//           }

//           if (room.students.length >= 2) {
//             errors.push({ name, roomNumber: room.roomNumber, message: `Room is full` });
//             continue;
//           }

//           const hashedPassword = await bcrypt.hash(password, 10);

//           const newUser = new User({
//             name,
//             email,
//             password: hashedPassword,
//             roomNumber: room.roomNumber,
//             mobileNumber,
//             rollNumber,
//           });

//           await newUser.save();

//           room.students.push(newUser._id);
//           await room.save();

//           addedStudents.push({ name, email, roomNumber: room.roomNumber });
//         } catch (err) {
//           console.error("Signup CSV Error:", err.message);
//           errors.push({ student: student.name, message: err.message });
//         }
//       }

//       return res.status(200).json({
//         success: addedStudents.length > 0,
//         addedStudents,
//         errors,
//       });
//     });
// });

router.post("/login", async (req, res) => {
  console.log("Received Login Request:", req.body);
  const { email, password } = req.body;

  if (!email.endsWith("@iiitg.ac.in")) {
    return res
      .status(400)
      .json({ message: "Only @iiitg.ac.in emails are allowed" });
  }

  try {
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const adminToken = jwt.sign({ role: "admin" }, JWT_SECRET, {
        expiresIn: "1h",
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
    console.log(token);

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
