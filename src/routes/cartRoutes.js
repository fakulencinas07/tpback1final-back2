import { Router } from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Ticket from '../models/Ticket.js';
import { v4 as uuidv4 } from 'uuid'; // Para generar un código único

const router = Router(); // Crear una instancia de Router

// Función para finalizar la compra
export const purchaseCart = async (req, res) => {
    const { userId } = req.params; // Obtener el ID del usuario de los parámetros de la solicitud
    try {
        // Obtener el carrito del usuario
        const cart = await Cart.findOne({ user: userId }).populate('products.product');
        
        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        let totalAmount = 0;
        const productsUnavailable = [];

        // Verificar stock de productos y calcular el monto total
        for (let item of cart.products) {
            const product = item.product;

            if (product.stock >= item.quantity) {
                totalAmount += product.price * item.quantity;
                product.stock -= item.quantity; // Restar del stock
                await product.save(); // Guardar los cambios en el producto
            } else {
                productsUnavailable.push(product._id); // Agregar al arreglo de productos sin stock
            }
        }

        // Eliminar del carrito los productos que fueron comprados
        cart.products = cart.products.filter(item => !productsUnavailable.includes(item.product._id));
        await cart.save();

        if (totalAmount > 0) {
            // Generar un ticket si hay productos disponibles
            const ticket = new Ticket({
                code: uuidv4(),
                purchase_datetime: new Date(),
                amount: totalAmount,
                purchaser: req.user.email // Asegúrate de que req.user tenga el correo del usuario
            });
            await ticket.save();

            return res.status(200).json({
                message: 'Compra realizada con éxito',
                ticket,
                productsUnavailable
            });
        } else {
            return res.status(400).json({ message: 'No hay productos disponibles para completar la compra' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al procesar la compra' });
    }
};

// Definir las rutas
router.post('/:userId/purchase', purchaseCart); // Ruta para finalizar la compra

export default router; // Exportar el enrutador
