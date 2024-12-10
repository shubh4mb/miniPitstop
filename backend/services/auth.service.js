import User from '../models/user_model.js';
import { ApiError } from '../middleware/error.middleware.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
    static generateTokens(userId) {
        // Access token - short lived (15 minutes)
        const accessToken = jwt.sign(
            { userId },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Refresh token - long lived (7 days)
        const refreshToken = jwt.sign(
            { userId, version: 'v1' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return { accessToken, refreshToken };
    }

    static async createUser(userData) {
        const { email, password, ...otherData } = userData;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new ApiError(409, 'User already exists');
        }

        // Hash password if provided
        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Create user
        const user = new User({
            email,
            password: hashedPassword,
            ...otherData
        });

        await user.save();
        
        // Generate tokens
        const tokens = this.generateTokens(user._id);
        
        return { user, tokens };
    }

    static async authenticateUser(email, password) {
        const user = await User.findOne({ email });
        
        if (!user || user.authProvider !== 'local') {
            throw new ApiError(401, 'Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new ApiError(401, 'Invalid credentials');
        }

        // Generate tokens
        const tokens = this.generateTokens(user._id);
        
        return { user, tokens };
    }

    static async handleGoogleAuth(googleData) {
        const { email, name } = googleData;

        let user = await User.findOne({ email });

        if (user) {
            if (user.authProvider !== 'google') {
                // Update existing user to use Google auth
                user.authProvider = 'google';
                user.fullName = name;
                await user.save();
            }
        } else {
            // Create new Google user
            user = await User.create({
                email,
                fullName: name,
                authProvider: 'google'
            });
        }

        // Generate tokens
        const tokens = this.generateTokens(user._id);
        
        return { user, tokens };
    }

    static async refreshToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);

            if (!user) {
                throw new ApiError(401, 'User not found');
            }

            // Generate new tokens
            const tokens = this.generateTokens(user._id);
            return tokens;
        } catch (error) {
            throw new ApiError(401, 'Invalid refresh token');
        }
    }

    static async generateUserResponse(user) {
        const { password, ...userWithoutPassword } = user.toObject();
        return userWithoutPassword;
    }
}
