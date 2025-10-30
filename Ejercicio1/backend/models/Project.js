const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teamMembers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['manager', 'developer', 'designer', 'tester'],
            default: 'developer'
        }
    }],
    status: {
        type: String,
        enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
        default: 'planning'
    },
    startDate: Date,
    endDate: Date,
    budget: Number,
    client: String
}, {
    timestamps: true
});

// Funcionalidad Adicional: Búsqueda con texto completo
projectSchema.index({ name: 'text', description: 'text' }); 

// Middleware para validaciones (Ejemplo: endDate > startDate)
projectSchema.pre('save', function (next) {
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
        return next(new Error('La fecha de fin (endDate) no puede ser anterior a la fecha de inicio (startDate).'));
    }
    next();
});

module.exports = mongoose.model('Project', projectSchema);