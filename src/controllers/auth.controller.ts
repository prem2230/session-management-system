import { Request, Response } from "express";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { createSession, deleteAllUserSessions, deleteSession } from "../services/session.service.js";
import { AuthRequest } from "../types/session-types.js";

const registerUser = async (req: Request, res: Response) => {
    try {
        const { username, firstName, lastName, email, age, mobile, password, confirmPassword } = req.body;

        if (!username || !firstName || !lastName || !email || !age || !mobile || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Please fill all the fields"
            });
        };

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        };

        const existingUser = await User.findOne({ $or: [{ email }, { username }, { mobile }] });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        };

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            firstName,
            lastName,
            email,
            age,
            mobile,
            password: hashedPassword
        });

        await user.save();

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        };

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        };

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        };

        const token = jwt.sign({
            userId: user._id,
            email: user.email
        },
            config.secretKey,
            { expiresIn: '1h' }
        );

        const sessionId = await createSession(user._id.toString(), user.email, user.username);

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token,
            sessionId
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const logoutUser = async (req: AuthRequest, res: Response) => {
    try {
        if (req.sessionId) {
            await deleteSession(req.sessionId);
            return res.status(200).json({
                success: true,
                message: "User logged out successfully"
            });
        }
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const logoutAllUserSessions = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.userId) {
            await deleteAllUserSessions(req.user.userId);
            return res.status(200).json({
                success: true,
                message: "All user sessions logged out successfully"
            });
        }
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.userId) {
            const user = await User.findById(req.user.userId).select("-password");
            return res.status(200).json({
                success: true,
                user
            });
        }
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export { registerUser, loginUser, logoutUser, logoutAllUserSessions };