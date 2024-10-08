import passport from 'passport';
import LocalStrategy from 'passport-local';
import User from '../models/user.js'; // Ajusta la ruta según tu estructura de carpetas
import bcrypt from 'bcrypt';

// Configuración de la estrategia local
passport.use(new LocalStrategy(
    { usernameField: 'email' }, // Asegúrate de que el campo esperado sea 'email'
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: 'Incorrect email.' });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

// Serialización y deserialización del usuario
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});
