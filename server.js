const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/dbConnect");
const doctorRoutes = require("./routes/DoctorRoutes");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to the database
connectDB();

// Middleware

// app.options("*", cors()); // Allow all preflight requests

app.use(cors({
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true // If using authentication tokens or cookies
}));


app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = file.originalname.split(".").pop();
        cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
    },
});

const upload = multer({ storage });
app.use(upload.any());

// Handle unexpected file upload errors
app.use((error, req, res, next) => {
    const message = `Unexpected field: ${error.field}`;
    return res.status(500).json({ error: message });
});

// Routes
app.use("/", doctorRoutes);

// Define server host and port
const PORT = process.env.PORT || 4400;
// const HOST = "192.168.0.106";
const HOST = "192.168.159.117";
// const HOST = "localhost";


// Start the server
app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`.bold.cyan);
});
