import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // Para hashear contraseñas

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: { type: String, unique: true },
    password: String, // Asegúrate de hashear la contraseña antes de guardar
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const User = mongoose.model('User', userSchema);
export default User;

