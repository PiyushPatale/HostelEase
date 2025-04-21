const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");
const Room = require("../models/Room");
require("dotenv").config();

const router = express.Router();

// const storage = multer.diskStorage({});
// const upload = multer({ storage });
const storage = multer.memoryStorage(); // Instead of diskStorage
const upload = multer({ storage });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
console.log(process.env.API_KEY);
console.log(process.env.CLOUD_NAME);
console.log(process.env.API_SECRET);

// router.post("/upload/:userId", upload.single("image"), async (req, res) => {
//   try {
//     console.log("File received:", req.file);
//     const result = await cloudinary.uploader.upload(req.file.path);
//     console.log("Cloudinary response:", result);
//     const user = await User.findByIdAndUpdate(
//       req.params.userId,
//       { profileImage: result.secure_url },
//       { new: true }
//     );
//     console.log("Updated user:", user);
//     res.json({ imageUrl: user.profileImage });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Image upload failed" });
//   }
// });

// router.post("/upload/:userId", upload.single("image"), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//     console.log("File received:", req.file);

//     const result = await cloudinary.uploader
//       .upload_stream({ resource_type: "image" }, async (error, result) => {
//         if (error) {
//           console.error("Cloudinary Error:", error);
//           return res.status(500).json({ error: "Cloudinary upload failed" });
//         }

//         console.log("Cloudinary response:", result);
//         const user = await User.findByIdAndUpdate(
//           req.params.userId,
//           { profileImage: result.secure_url },
//           { new: true }
//         );

//         console.log("Updated user:", user);
//         res.json({ imageUrl: user.profileImage });
//       })
//       .end(req.file.buffer);

//     // result.end(req.file.buffer); // Upload buffer directly
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Image upload failed" });
//   }
// });

router.post("/upload/:userId", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(buffer);
      });
    };

    const result = await streamUpload(req.file.buffer);

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { profileImage: result.secure_url },
      { new: true }
    );

    res.json({ imageUrl: user.profileImage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Image upload failed" });
  }
});


// GET /api/users/my-room/:userId
router.post("/my-room", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user || !user.roomNumber) {
      return res.status(404).json({ message: "User or room not found" });
    }

    // Normalize user.roomNumber
    let normalizedRoomNumber = user.roomNumber.toString().trim().toUpperCase();

    // Convert A030 → A-030
    if (/^[A-Z]\d+$/.test(normalizedRoomNumber)) {
      normalizedRoomNumber = normalizedRoomNumber.replace(/([A-Z])(\d+)/, "$1-$2");
    }

    // Fetch all rooms and manually match the normalized number
    const allRooms = await Room.find({}).populate("students", "-password");

    const room = allRooms.find(
      (r) => r.roomNumber.toString().trim().toUpperCase() === normalizedRoomNumber
    );

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Determine hostel type
    let hostel = "Boys Hostel";
    if (normalizedRoomNumber.startsWith("G")) hostel = "Girls Hostel";
    else if (normalizedRoomNumber.startsWith("A")) hostel = "Annexure I";
    else if (normalizedRoomNumber.startsWith("B")) hostel = "Annexure II";

    // Determine floor
    const floor = /^[A-Z]-/.test(normalizedRoomNumber)
      ? normalizedRoomNumber[2] === "0"
        ? "Ground Floor"
        : `${normalizedRoomNumber[2]}${getOrdinalSuffix(normalizedRoomNumber[2])} Floor`
      : `${Math.floor(parseInt(normalizedRoomNumber) / 100)}th Floor`;

    const roommate = room.students.find(
      (student) => student._id.toString() !== userId
    );

    res.status(200).json({
      roomDetails: {
        roomNumber: room.roomNumber,
        floor,
        hostel,
        type: "Double Sharing",
        amenities: ["Bed", "Study Table", "Wardrobe", "WiFi"],
      },
      roommate: roommate
        ? {
            name: roommate.name,
            rollNumber: roommate.rollNumber,
            contact: roommate.email,
            department: roommate.mobileNumber,
          }
        : null,
    });
  } catch (error) {
    console.error("Error in /my-room:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});



// Helper function to get floor suffix
function getOrdinalSuffix(num) {
  const int = parseInt(num);
  if (int === 1) return "st";
  if (int === 2) return "nd";
  if (int === 3) return "rd";
  return "th";
}

// Fetching user profile image
router.get("/image/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || !user.profileImage) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.json({ imageUrl: user.profileImage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch image" });
  }
});


router.get("/", async (req, res) => {
  try {
    const students = await User.find({ isAdmin: false }); // Fetch users where isAdmin is false
    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/delete-students", async (req, res) => {
  try {
    const { rollNumbers } = req.body; // Expecting an array of roll numbers

    if (!Array.isArray(rollNumbers) || rollNumbers.length === 0) {
      return res
        .status(400)
        .json({
          message: "Invalid request. Provide roll numbers in an array.",
        });
    }

    // Find all students with the given roll numbers
    const students = await User.find({ rollNumber: { $in: rollNumbers } });

    if (students.length === 0) {
      return res
        .status(404)
        .json({ message: "No students found with the provided roll numbers." });
    }

    // Remove students from their assigned rooms
    for (const student of students) {
      const room = await Room.findOne({ roomNumber: student.roomNumber });

      if (room) {
        room.students = room.students.filter(
          (id) => id.toString() !== student._id.toString()
        );
        await room.save();
      }
    }

    // Delete students from DB
    await User.deleteMany({ rollNumber: { $in: rollNumbers } });

    res.json({
      message: "Students deleted successfully",
      deletedRollNumbers: rollNumbers,
    });
  } catch (error) {
    console.error("Error deleting students:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
