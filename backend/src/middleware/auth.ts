import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

type UserRole = 'admin';

interface AuthTokenPayload {
    sub: string;
    role: UserRole;
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        res.status(500).json({ message: 'Authentication is not configured' });
        return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Missing or invalid Authorization header' });
        return;
    }

    try {
        const payload = jwt.verify(
            authHeader.slice('Bearer '.length).trim(),
            jwtSecret,
            { algorithms: ['HS256'] }
        );

        if (typeof payload === 'string' || typeof payload.sub !== 'string' || payload.role !== 'admin') {
            res.status(401).json({ message: 'Invalid or expired token' });
            return;
        }

        req.user = { sub: payload.sub, role: 'admin' } satisfies AuthTokenPayload;
        next();
    } catch {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export const requireRole = (role: UserRole) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        if (req.user.role !== role) {
            res.status(403).json({ message: 'Insufficient permissions' });
            return;
        }

        next();
    };
};
