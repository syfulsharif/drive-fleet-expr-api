import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// Route imports
import authRoutes from "./routes/authRoutes";
import carRoutes from "./routes/carRoutes";
import bookingRoutes from "./routes/bookingRoutes";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI ?? "";

let isConnected = false;
const connectDB = async () => {
  if (!mongoURI) {
    console.warn("No MONGODB_URI provided: database connection will be skipped.");
    return;
  }

  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log("✅ Connected to MongoDB cluster.");
  } catch (err) {
    isConnected = false;
    console.error("❌ MongoDB Connection Error:", err);
  }
};

// Initial connection for long-running servers
connectDB();

// Ensure DB is connected for all API requests
app.use("/api", async (req, res, next) => {
  await connectDB();
  next();
});

// --- Health Check ---
app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({ status: "ok", dbStatus, timestamp: new Date().toISOString() });
});

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/bookings", bookingRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(err.status || 500).json({ 
    message: err.message || "Internal server error" 
  });
});

async function startServer() {
  if (!process.env.VERCEL) {
    let currentPort = PORT;
    while (true) {
      try {
        await new Promise<void>((resolve, reject) => {
          const server = app.listen(currentPort, "0.0.0.0", () => {
            console.log(`🚀 DriveFleet API running on http://localhost:${currentPort}`);
            console.log(`📝 Health check: http://localhost:${currentPort}/api/health`);
            resolve();
          });

          server.on("error", reject);
        });
        break;
      } catch (err: any) {
        if (err?.code === "EADDRINUSE") {
          console.warn(`⚠️  Port ${currentPort} is already in use. Trying port ${currentPort + 1}...`);
          currentPort += 1;
          continue;
        }
        console.error("❌ Server failed to start:", err);
        throw err;
      }
    }
  }
}

const calledDirectly = typeof process.argv[1] === "string" && /server\.(ts|js|cjs)$/.test(process.argv[1]);

if (calledDirectly) {
  startServer();
}

export default app;
