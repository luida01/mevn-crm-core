import { Router } from 'express';
import { timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';

const router = Router();

const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message: 'Too many login attempts. Try again later.' }
});

const matchesSecret = (candidate: string, expected: string): boolean => {
    const candidateBuffer = Buffer.from(candidate, 'utf8');
    const expectedBuffer = Buffer.from(expected, 'utf8');

    return candidateBuffer.byteLength === expectedBuffer.byteLength
        && timingSafeEqual(candidateBuffer, expectedBuffer);
};

router.post('/login', loginRateLimit, (req, res) => {
    const body: unknown = req.body;
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
        res.status(400).json({ message: 'A JSON object with username and password is required' });
        return;
    }

    const { username, password } = body as Record<string, unknown>;
    if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password) {
        res.status(400).json({ message: 'username and password are required' });
        return;
    }

    const adminUsername = process.env.ADMIN_USERNAME || '';
    const adminPassword = process.env.ADMIN_PASSWORD || '';
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        res.status(500).json({ message: 'Authentication is not configured' });
        return;
    }

    if (!matchesSecret(username.trim(), adminUsername) || !matchesSecret(password, adminPassword)) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
    }

    const token = jwt.sign(
        { sub: adminUsername, role: 'admin' },
        jwtSecret,
        { algorithm: 'HS256', expiresIn: '8h' }
    );

    res.json({ token, tokenType: 'Bearer', expiresIn: '8h' });
});

export default router;
