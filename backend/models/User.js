const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roomNumber: { type: String, required: false },
  mobileNumber: { type: String, required: true },
  rollNumber: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  profileImage: {
    data: Buffer,  // Store image as binary
    contentType: String, // Store image type (e.g., image/png, image/jpeg)
  },
});

module.exports = mongoose.model("User", userSchema);
