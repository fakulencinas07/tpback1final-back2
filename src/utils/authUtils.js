import jwt from 'jsonwebtoken';
import { promisify } from 'util';

const secretKey = process.env.JWT_SECRET || 'your_jwt_secret';

// Promisify jwt.verify for async/await usage
const verifyJwt = promisify(jwt.verify);

/**
 * Generates a JSON Web Token (JWT) for a user.
 * @param {Object} user - The user object.
 * @returns {String} - The generated JWT.
 */
export function generateToken(user) {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
    };
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

/**
 * Verifies a JWT and returns the decoded payload.
 * @param {String} token - The JWT to verify.
 * @returns {Promise<Object>} - The decoded payload.
 */
export async function verifyToken(token) {
    try {
        const decoded = await verifyJwt(token, secretKey);
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}
