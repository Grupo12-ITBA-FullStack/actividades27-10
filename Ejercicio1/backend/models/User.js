const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true },
    // Otros campos relevantes para un usuario...
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);