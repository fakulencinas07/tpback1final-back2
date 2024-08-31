import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwtConfig.js';
import bcrypt from 'bcrypt';

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
    res.cookie('token', token, { httpOnly: true }).json({ status: 'success', token });
};

const current = async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ status: 'error', message: 'No token found' });

    try {
        const decoded = jwt.verify(token, jwtConfig.secret);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ status: 'error', message: 'User not found' });

        res.json({ status: 'success', user });
    } catch (error) {
        res.status(401).json({ status: 'error', message: 'Invalid token' });
    }
};

export { login, current };
