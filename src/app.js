import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import dotenv from 'dotenv';
import { MONGO_URI, PORT } from './config/config.js';
import './config/passportConfig.js'; 
import { engine } from 'express-handlebars';
import flash from 'connect-flash';

dotenv.config();

const app = express();

// Configuración de Handlebars
app.engine('handlebars', engine({
    extname: '.handlebars',
    defaultLayout: 'main', // Asegúrate de que este archivo exista en src/views/layouts/
}));
app.set('view engine', 'handlebars');
app.set('views', './src/views');  // Ruta correcta para tus vistas

// Configuración de la sesión
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' ? true : false } // Asegúrate de que esta opción esté bien configurada
}));

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

// Rutas
app.get('/', (req, res) => {
    res.render('home', { user: req.user });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/login', (req, res) => {
    res.render('login'); // Asegúrate de tener un archivo login.handlebars en src/views/
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true // Asegúrate de tener mensajes flash configurados
}));

// Usar las rutas API
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/sessions', sessionRoutes);

// Conectar a MongoDB
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB', err));

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
