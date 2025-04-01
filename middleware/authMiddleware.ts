import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: { 
        userId: string; 
        role: string;   
    };
}

export const isAuthenticated = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET; 

    if (!secret) {
        console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
        return res.status(500).json({ success: false, message: "Internal server error: Authentication configuration missing" });
    }

    try {
        const decoded = jwt.verify(token, secret) as { id: string; role: string; iat: number; exp: number }; // Assuming your signJwt uses 'id' and 'role' keys

        req.user = {
            userId: decoded.id, 
            role: decoded.role   
        };

        next(); 
    } catch (error) {
        console.error("JWT Verification Error:", error);
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Token expired' });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
        }
        return res.status(401).json({ success: false, message: 'Unauthorized: Token verification failed' });
    }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
    }

    next();
};

export const isOperator = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'operator') {
        return res.status(403).json({ success: false, message: 'Forbidden: Operator access required' });
    }
    next();
};