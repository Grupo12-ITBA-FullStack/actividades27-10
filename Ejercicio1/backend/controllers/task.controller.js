const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Listar Tareas (con filtros, sort, paginación)
// @route   GET /api/tasks
exports.getTasks = async (req, res, next) => {
  try {
    const { project, assignedTo, status, priority, search, sort, page = 1, limit = 10 } = req.query;
    let queryFilters = {}; 

    // Filtrado por múltiples criterios 
    if (project) queryFilters.project = project;
    if (assignedTo) queryFilters.assignedTo = assignedTo;
    if (status) queryFilters.status = status;
    if (priority) queryFilters.priority = priority;
    if (search) queryFilters.$text = { $search: search }; 

    let query = Task.find(queryFilters)
      .populate('project', 'name') 
      .populate('assignedTo', 'name email'); 

    if (sort) {
      query = query.sort(sort); 
    }

    const skip = (Number(page) - 1) * Number(limit);
    query = query.skip(skip).limit(Number(limit)); 

    const tasks = await query;
    const totalTasks = await Task.countDocuments(queryFilters);

    res.status(200).json({
      totalTasks,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: Number(page),
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Crear Tarea
// @route   POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    const { title, project } = req.body;
    if (!title || !project) {
      const error = new Error('Faltan campos obligatorios: title y project');
      error.status = 400;
      return next(error);
    }
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      const error = new Error('El proyecto asociado no existe');
      error.status = 404;
      return next(error);
    }
    
    const newTask = new Task(req.body);
    const savedTask = await newTask.save(); 
    res.status(201).json(savedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener una Tarea por ID (con populate)
// @route   GET /api/tasks/:id
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name') 
      .populate('assignedTo', 'name email') 
      .populate('dependencies', 'title status'); 
      
    if (!task) {
      const error = new Error('Tarea no encontrada');
      error.status = 404;
      return next(error);
    }
    res.status(200).json(task); 
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar Tarea
// @route   PUT /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedTask) {
      const error = new Error('Tarea no encontrada');
      error.status = 404;
      return next(error);
    }
    res.status(200).json(updatedTask); 
  } catch (error) {
    next(error);
  }
};

// Eliminar (Lógico) Tarea
// DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const deletedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!deletedTask) {
      const error = new Error('Tarea no encontrada');
      error.status = 404;
      return next(error);
    }
    res.status(200).json({ mensaje: 'Tarea eliminada lógicamente' });
  } catch (error) {
    next(error);
  }
};