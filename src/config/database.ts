import mongoose from "mongoose";
import { config } from "./env.js";

export const connectDB = async () => {
    try {
        await mongoose.connect(config.mongodb.uri);
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("Error connecting to the database", err);
        process.exit(1);
    }
}