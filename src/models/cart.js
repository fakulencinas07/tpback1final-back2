import mongoose from 'mongoose';
const { Schema, model } = mongoose;

// Esquema para un producto dentro del carrito
const productSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product', // Referencia al modelo Product
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1 // La cantidad mínima debe ser 1
    }
}, { _id: false }); // Desactiva la creación de _id para subdocumentos

// Esquema para el carrito
const cartSchema = new Schema({
    products: [productSchema], // Arreglo de productos en el carrito
}, {
    timestamps: true // Incluye createdAt y updatedAt en el esquema
});

// Crear el modelo del carrito y exportarlo
const Cart = model('Cart', cartSchema);

export default Cart;
