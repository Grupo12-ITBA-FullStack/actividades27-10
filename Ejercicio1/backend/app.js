require('dotenv').config(); 
const express = require('express');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const taskRoutes = require('./routes/Task');
// const projectRoutes = require('./routes/Project'); 

// 1. Conexión a la base de datos
connectDB();

const app = express();
app.use(express.json()); // Habilita la lectura de JSON en el body

// 2. Montar las rutas (Ejemplo de API RESTful con /api/tasks)
app.use('/api/tasks', taskRoutes);
// app.use('/api/projects', projectRoutes);

// 3. Manejo de errores global (Debe ir al final de todas las rutas)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));