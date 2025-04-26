const express = require("express");
const {
  createRoom,
  getAllRooms,
  assignStudent,
  removeStudent,
  getVacantRooms,
  getOccupiedRooms,
} = require("../controllers/RoomController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", protect, adminOnly, createRoom); 
router.get("/", getAllRooms); 
router.put("/assign", protect, adminOnly, assignStudent); 
router.put("/remove", protect, adminOnly, removeStudent); 
router.get("/vacant", getVacantRooms); 
router.get("/occupied", getOccupiedRooms);


module.exports = router;
