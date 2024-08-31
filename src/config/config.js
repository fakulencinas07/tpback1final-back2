import dotenv from 'dotenv';
dotenv.config();

// Extrae las variables de entorno del archivo .env
const {
    MONGO_URI,    // URI para conectarse a MongoDB
    JWT_SECRET,   // Clave secreta para JWT
    PORT = 3000   // Puerto para el servidor, por defecto 3000 si no se define en .env
} = process.env;

// Verificación de que MONGO_URI esté definido
if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
}

// Verificación de que JWT_SECRET esté definido
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}

// Exporta las variables para usarlas en otras partes de la aplicación
export {
    MONGO_URI,
    JWT_SECRET,
    PORT
};
