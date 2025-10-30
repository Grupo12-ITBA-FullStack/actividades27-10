const Task = require('../models/Task');

// Implementa: Create: Crear nuevos registros con validación
exports.createTask = async (req, res, next) => {
    try {
        const newTask = await Task.create(req.body);
        res.status(201).json(newTask);
    } catch (error) {
        next(error); 
    }
};

// Implementa: Read: Obtener registros individuales por ID y Populate
exports.getTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('project', 'name status') 
            .populate('assignedTo', 'username email'); 
            
        if (!task) return res.status(404).json({ message: 'Tarea no encontrada.' });
        res.json(task);
    } catch (error) {
        next(error); 
    }
};

// Implementa: Update: Actualizar registros parcial o completamente con validación
exports.updateTask = async (req, res, next) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // new: devuelve el doc actualizado, runValidators: ejecuta validaciones
        );
        
        if (!task) return res.status(404).json({ message: 'Tarea no encontrada.' });
        res.json(task);
    } catch (error) {
        next(error); 
    }
};

// Implementa: Delete: Eliminar registros (físico)
exports.deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ message: 'Tarea no encontrada.' });
        res.status(204).send(); // 204 No Content
    } catch (error) {
        next(error);
    }
};

// Implementa: List: Listar con Paginación, Filtros y Ordenamiento
exports.listTasks = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', status, priority, project, assignedTo } = req.query;

        // 1. Filtrado por múltiples criterios
        const filter = {};
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (project) filter.project = project; 
        if (assignedTo) filter.assignedTo = assignedTo;

        // 2. Ordenamiento
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // 3. Consulta con Paginación y Populate
        const tasks = await Task.find(filter)
            .sort(sort)
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .populate('assignedTo', 'username');

        const total = await Task.countDocuments(filter);

        res.json({
            data: tasks,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        next(error);
    }
};

// Funcionalidad Adicional: Búsqueda con texto completo
exports.searchTasks = async (req, res, next) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ message: 'El parámetro "query" es requerido para la búsqueda.' });
        
        const tasks = await Task.find({ $text: { $search: query } })
            .sort({ score: { $meta: 'textScore' } }) // Opcional: ordenar por relevancia
            .populate('assignedTo', 'username');

        res.json(tasks);
    } catch (error) {
        next(error);
    }
};