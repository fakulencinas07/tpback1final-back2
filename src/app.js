import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import flash from 'connect-flash';
import { engine } from 'express-handlebars';

import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';

import { MONGO_URI, PORT } from './config/config.js';
import './config/passportConfig.js';
import { isAdmin, isUser } from './middleware/authMiddleware.js'; // Middleware para autorización

dotenv.config();

const app = express();

// Configuración de Handlebars
app.engine('handlebars', engine({
    extname: '.handlebars',
    defaultLayout: 'main', 
}));
app.set('view engine', 'handlebars');
app.set('views', './src/views');  // Ruta donde se encuentran las vistas

// Configuración de la sesión
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' ? true : false } // Ajusta según tu entorno
}));

// Middleware de Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de flash
app.use(flash());

// Middleware para mensajes flash
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

// Rutas de la aplicación
app.get('/', (req, res) => {
    res.render('home', { user: req.user });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/login', (req, res) => {
    res.render('login');
});

// Manejo del registro de usuario
app.post('/register', async (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'El usuario ya existe');
            return res.redirect('/register');
        }

        // Crear un nuevo usuario
        const newUser = new User({
            first_name,
            last_name,
            email,
            password // Asegúrate de hashear la contraseña antes de guardar en producción
        });

        await newUser.save();
        req.flash('success', 'Usuario registrado con éxito');
        res.redirect('/login');
    } catch (error) {
        console.error('Error al registrar el nuevo usuario:', error);
        req.flash('error', 'Error interno del servidor');
        res.redirect('/register');
    }
});

// Manejo del inicio de sesión
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true // Mensajes de error en caso de fallo
}));

// Usar las rutas API
app.use('/api/users', userRoutes);

// Solo un administrador puede acceder a las rutas de productos
app.use('/api/products', isAdmin, productRoutes);

// Solo un usuario puede acceder a las rutas de carrito
app.use('/api/carts', isUser, cartRoutes);

// Rutas de sesión
app.use('/api/sessions', sessionRoutes);

// Conectar a MongoDB
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error al conectar a MongoDB', err));

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
