import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
      },
    password: {
        type: String,
        required: true
      },
      tcKimlik: {
        type: String,
        required: true,
        unique: true,
        match: /^[0-9]{11}$/,
    },
    birthYear: {
        type: Number,
        required: true,
    },
    role: {
        type: String,
        enum: ['Aday', 'Admin', 'Jüri Üyesi', 'Yönetici'],
        default: 'Aday'
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: false
    },
}, {timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;