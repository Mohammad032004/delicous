import "dotenv/config";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ MONGODB_URI is missing from .env.local");
  process.exit(1);
}

async function testDatabase() {
  try {
    console.log("🔄 Connecting to MongoDB...");

    await mongoose.connect(uri as string);

    console.log("✅ MongoDB connected successfully!");
    console.log(`📦 Database: ${mongoose.connection.name}`);

    await mongoose.disconnect();

    console.log("🔌 Connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ MongoDB connection failed.");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exit(1);
  }
}

testDatabase();