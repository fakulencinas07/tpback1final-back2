import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Registrar un nuevo usuario
export const registerUser = async (req, res) => {
    try {
        const { first_name, last_name, email, password, age } = req.body;
        
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 'error', message: 'User already exists' });
        }

        // Crear nuevo usuario
        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = new User({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            age
        });

        await newUser.save();
        res.status(201).json({ status: 'success', message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Iniciar sesión
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Verificar si el usuario existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ status: 'error', message: 'Invalid email or password' });
        }

        // Verificar la contraseña
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: 'error', message: 'Invalid email or password' });
        }

        // Crear y enviar token JWT
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ status: 'success', token });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Obtener el usuario actual
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        res.json({ status: 'success', payload: user });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
