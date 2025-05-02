const mongoose = require('mongoose');

const roomChangeRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentRoom: {
    type: String,
    required: true
  },
  requestedRoom: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  }
});

// Create the model
const RoomChangeRequest = mongoose.model('RoomChangeRequest', roomChangeRequestSchema);

// Export the model
module.exports = RoomChangeRequest;