import mongoose from "mongoose";
import { IUser } from "../types/schema-types";

const user = new mongoose.Schema<IUser>({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: [true, "Username must be unique"],
        trim: true
    },
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
        required: [true, "Email is required"],
        unique: [true, "Email must be unique"]
    },
    age: {
        type: Number,
        required: [true, "Age is required"],
        min: [0, "Age cannot be negative"]
    },
    mobile: {
        type: Number,
        required: [true, "Mobile number is required"],
        unique: [true, "Mobile number must be unique"],
        length: [10, "Mobile number must be 10 digits"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"],
        match: [/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.']
    },
},
    { timestamps: true }
);

export const User = mongoose.model<IUser>("User", user);