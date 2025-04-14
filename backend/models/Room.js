const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: { type: String, enum: ["Vacant", "Occupied"], default: "Vacant" },
});

// Middleware to auto-update room status
roomSchema.pre("save", function (next) {
  this.status = this.students.length < 2 ? "Vacant" : "Occupied";
  next();
});

module.exports = mongoose.model("Room", roomSchema);
