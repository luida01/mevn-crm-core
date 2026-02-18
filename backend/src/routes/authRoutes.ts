import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', (req, res) => {
    const { username, password } = req.body as { username?: string; password?: string };
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminUsername || !adminPassword || !jwtSecret) {
        res.status(500).json({ message: 'Auth environment variables are not configured' });
        return;
    }

    if (!username || !password) {
        res.status(400).json({ message: 'username and password are required' });
        return;
    }

    if (username !== adminUsername || password !== adminPassword) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
    }

    const token = jwt.sign(
        { sub: username, role: 'admin' },
        jwtSecret,
        { expiresIn: '8h' }
    );

    res.json({ token, tokenType: 'Bearer', expiresIn: '8h' });
});

export default router;

