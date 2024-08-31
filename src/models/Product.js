import mongoose from 'mongoose';
const { Schema, model } = mongoose;

// Esquema para el producto
const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true // Elimina los espacios en blanco al principio y al final
    },
    price: {
        type: Number,
        required: true,
        min: 0 // El precio debe ser un número positivo
    },
    category: {
        type: String,
        required: true,
        trim: true // Elimina los espacios en blanco al principio y al final
    },
    available: {
        type: Boolean,
        required: true,
        default: true // Valor predeterminado es verdadero (disponible)
    }
}, {
    timestamps: true // Incluye createdAt y updatedAt en el esquema
});

// Crear el modelo del producto y exportarlo
const Product = model('Product', productSchema);

export default Product;
