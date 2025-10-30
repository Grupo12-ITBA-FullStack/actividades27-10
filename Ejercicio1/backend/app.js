require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Conectar a la base de datos
connectDB();

const app = express();

// Middlewares
app.use(express.json());


// Importar rutas
const taskRoutes = require('./routes/Task');
const projectRoutes = require('./routes/Project'); 
const userRoutes = require('./routes/User');     

// Usar rutas 
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes); 
app.use('/api/users', userRoutes);      


// Manejador de errores 
app.use(errorHandler);

// Iniciar servidor 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});