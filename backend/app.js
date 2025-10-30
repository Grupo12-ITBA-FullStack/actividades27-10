const express = require('express');
const mongoose = require('mongoose'); 
const ProductsRouter = require('./routes/Product');
const CategoriesRouter = require('./routes/Category');
const app = express();
// const PORT = process.env.PORT || 3000;
 
const DB_URI = 'mongodb+srv://agustinbarbero932_db_user:OAgv11ImjMA6EMSq@clustergrupo12.1wkkscq.mongodb.net/';

mongoose.connect(DB_URI)
  .then(() => console.log('¡Conexión exitosa a MongoDB!'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));
 

  
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Error de validación', 
      details: Object.values(err.errors).map(e => e.message) 
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ 
      error: `El ${field} ya existe` 
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ 
      error: 'ID inválido' 
    });
  }

  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
};

app.use(express.json());
 
// Definir una ruta de prueba para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.send('Servidor Express funcionando y conectado a MongoDB (esperemos!)');
});

app.use(errorHandler);
app.use('/products', ProductsRouter );
app.use('/categories', CategoriesRouter );
 
// Ruta de 404 y manejo de errores 
app.use((req, res, next) => {
  res.status(404).send('Página no encontrada');
});
 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal en el servidor');
});
 
// Iniciar el servidor Express
// app.listen(PORT, () => {
//   console.log(`Servidor Express escuchando en el puerto ${PORT}`);
//   console.log(`Accede desde tu navegador: http://localhost:${PORT}`);
// });

module.exports = app;