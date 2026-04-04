import mongoose from "mongoose";

import config from "./config.js";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.MONGODB_URI || "mongodb+srv://gaurav_db:GAURAV16@veera.agkbfgu.mongodb.net/veera");
        console.log(`✅ MongoDB Connected`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};