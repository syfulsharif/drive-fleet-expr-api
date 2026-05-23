const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/authRoutes.js");
const carRoutes = require("./routes/carRoutes.js");
const bookingRoutes = require("./routes/bookingRoutes.js");

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Vercel deployment check
const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';

// CORS configuration for both local and production
const getAllowedOrigins = () => {
  if (isVercel) {
    const origins = [
      process.env.CORS_ORIGIN,
      process.env.VERCEL_URL,
      /\.vercel\.app$/,
    ].filter(Boolean);
    return origins;
  }
  return process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
    : ["http://localhost:5173", "http://localhost:3000", "http://localhost:8000"];
};

const allowedOrigins = getAllowedOrigins();

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    let allowed = false;
    for (const o of allowedOrigins) {
      if (o instanceof RegExp) {
        if (o.test(origin)) { allowed = true; break; }
      } else if (origin === o || (typeof o === 'string' && origin.includes(o))) {
        allowed = true; break;
      }
    }
    
    if (allowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || "";

// Mongoose connection cache for serverless
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (!mongoURI) {
    console.warn("No MONGODB_URI provided");
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(mongoURI, opts).then(() => {
      console.log("✅ Connected to MongoDB");
      return mongoose;
    }).catch(err => {
      console.error("❌ MongoDB Connection Error:", err.message);
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

// Ensure DB is connected for all API requests
app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("DB connection error:", err.message);
  }
  next();
});

// Health Check
app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({ status: "ok", dbStatus, timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/bookings", bookingRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({ 
    message: err.message || "Internal server error" 
  });
});

// Export for Vercel
module.exports = app;

// Only start server locally
if (!isVercel && process.argv[1]?.includes('server.js')) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 DriveFleet API running on http://localhost:${PORT}`);
  });
}