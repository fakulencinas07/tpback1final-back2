import express from 'express';
import { getCart, addProductToCart, removeProductFromCart, clearCart } from '../controllers/cartController.js';

const router = express.Router();

// Rutas para el carrito
router.get('/:userId', getCart);
router.post('/:userId/products', addProductToCart);
router.delete('/:userId/products', removeProductFromCart);
router.delete('/:userId', clearCart);

export default router;
