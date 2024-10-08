import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Ticket from '../models/Ticket.js';
import { ObjectId } from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // Para generar un código único

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
        console.error(error); // Registrar el error para el desarrollador
        res.status(500).json({ status: 'error', message: 'Error retrieving cart' });
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

        // Verificación de la cantidad
        if (!quantity || quantity <= 0) {
            return res.status(400).json({ status: 'error', message: 'Quantity must be greater than 0' });
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
        console.error(error); // Registrar el error para el desarrollador
        res.status(500).json({ status: 'error', message: 'Error adding product to cart' });
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
        console.error(error); // Registrar el error para el desarrollador
        res.status(500).json({ status: 'error', message: 'Error removing product from cart' });
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
        console.error(error); // Registrar el error para el desarrollador
        res.status(500).json({ status: 'error', message: 'Error clearing cart' });
    }
};

// Función para finalizar la compra
export const purchaseCart = async (req, res) => {
    const { userId } = req.params;
    try {
        const cart = await Cart.findOne({ user: userId }).populate('products.product');
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        let totalAmount = 0;
        const productsUnavailable = [];

        for (let item of cart.products) {
            const product = item.product;

            // Verificación de existencia de stock
            if (!product) {
                productsUnavailable.push(item.product); // Añadir el producto no encontrado
                continue; // Continuar al siguiente producto
            }

            if (product.stock >= item.quantity) {
                totalAmount += product.price * item.quantity;
                product.stock -= item.quantity; 
                await product.save(); 
            } else {
                productsUnavailable.push(product._id); 
            }
        }

        cart.products = cart.products.filter(item => !productsUnavailable.includes(item.product._id));
        await cart.save();

        if (totalAmount > 0) {
            const ticket = new Ticket({
                code: uuidv4(),
                purchase_datetime: new Date(),
                amount: totalAmount,
                purchaser: req.user.email 
            });
            await ticket.save();

            return res.status(200).json({
                message: 'Purchase successful',
                ticket,
                productsUnavailable
            });
        } else {
            return res.status(400).json({ message: 'No products available for purchase' });
        }

    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: 'Error processing purchase' });
    }
};
