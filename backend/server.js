const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");
const studentRoutes = require("./routes/studentRoutes");
const roomChangeRoutes = require("./routes/roomChangeRoutes");
const cors = require("cors");
require("dotenv").config();


const app = express();


app.use(express.json());
const allowedOrigins = ['https://hostelmanage-six.vercel.app', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

connectDB();    

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/room", roomChangeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => // console.log(`Server running on port ${PORT}`));
