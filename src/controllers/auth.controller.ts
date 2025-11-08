import { Request, Response } from "express";

const registerUser = async (req: Request, res: Response) => {
    try {
        const { username, firstName, lastName, email, age, mobile, password } = req.body;

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export { registerUser };