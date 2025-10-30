const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Error interno del servidor.';

    // Error de Validación de Mongoose
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Error de validación: ' + Object.values(err.errors).map(val => val.message).join(', ');
    }
    
    // Error de Cast (ID inválido)
    if (err.name === 'CastError') {
        statusCode = 404; // 404 para no revelar que el ID existe pero es inválido
        message = `Recurso no encontrado o ID inválido.`;
    }
    
    // Errores de duplicidad (11000)
    if (err.code === 11000) {
        statusCode = 400;
        message = `El campo ya existe.`;
    }

    res.status(statusCode).json({
        success: false,
        error: message,
    });
};

module.exports = errorHandler;