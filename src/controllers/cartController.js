import Cart from '../models/cart.js';
import Product from '../models/Product.js';
import { ObjectId } from 'mongoose';

// Función para obtener el carrito de un usuario
export const getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ status: 'error', message: 'Invalid user ID' });
        }

        const cart = await Cart.findOne({ user: userId }).populate('products.product');
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Cart not found' });
        }

        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Función para agregar un producto al carrito
export const addProductToCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId, quantity } = req.body;

        if (!ObjectId.isValid(userId) || !ObjectId.isValid(productId)) {
            return res.status(400).json({ status: 'error', message: 'Invalid user or product ID' });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Cart not found' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Product not found' });
        }

        const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
        if (productIndex > -1) {
            cart.products[productIndex].quantity += quantity;
        } else {
            cart.products.push({ product: productId, quantity });
        }

        await cart.save();
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Función para eliminar un producto del carrito
export const removeProductFromCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId } = req.body;

        if (!ObjectId.isValid(userId) || !ObjectId.isValid(productId)) {
            return res.status(400).json({ status: 'error', message: 'Invalid user or product ID' });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Cart not found' });
        }

        cart.products = cart.products.filter(p => p.product.toString() !== productId);
        await cart.save();
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Función para vaciar el carrito
export const clearCart = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ status: 'error', message: 'Invalid user ID' });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Cart not found' });
        }

        cart.products = [];
        await cart.save();
        res.json({ status: 'success', message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
