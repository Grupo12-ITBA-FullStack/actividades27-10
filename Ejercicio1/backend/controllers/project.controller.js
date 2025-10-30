const Project = require('../models/Project');
const User = require('../models/User');

// Listar Proyectos (con filtros, sort, paginación)
// GET /api/projects
exports.getProjects = async (req, res, next) => {
  try {
    const { status, owner, search, sort, page = 1, limit = 10 } = req.query;
    let queryFilters = {}; 

    if (status) queryFilters.status = status;
    if (owner) queryFilters.owner = owner;
    if (search) queryFilters.$text = { $search: search };

    let query = Project.find(queryFilters)
      .populate('owner', 'name email') 
      .populate('teamMembers.user', 'name email'); 

    if (sort) {
      query = query.sort(sort);
    }

    const skip = (Number(page) - 1) * Number(limit);
    query = query.skip(skip).limit(Number(limit)); 

    const projects = await query;
    const totalProjects = await Project.countDocuments(queryFilters);

    res.status(200).json({
      totalProjects,
      totalPages: Math.ceil(totalProjects / limit),
      currentPage: Number(page),
      projects,
    });
  } catch (error) {
    next(error);
  }
};

// Crear Proyecto
// POST /api/projects
exports.createProject = async (req, res, next) => {
  try {
    const { name, owner } = req.body;
    if (!name || !owner) {
      const error = new Error('Faltan campos obligatorios: name y owner');
      error.status = 400;
      return next(error);
    }
    const userExists = await User.findById(owner);
    if (!userExists) {
      const error = new Error('El usuario "owner" no existe');
      error.status = 404;
      return next(error);
    }
    
    const newProject = new Project(req.body);
    const savedProject = await newProject.save(); 
    res.status(201).json(savedProject);
  } catch (error) {
    next(error);
  }
};

// Obtener un Proyecto por ID (con populate)
// GET /api/projects/:id
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email') 
      .populate('teamMembers.user', 'name email'); 
      
    if (!project) {
      const error = new Error('Proyecto no encontrado');
      error.status = 404;
      return next(error);
    }
    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

// Actualizar Proyecto
//PUT /api/projects/:id
exports.updateProject = async (req, res, next) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // [cite: 116]
    });
    if (!updatedProject) {
      const error = new Error('Proyecto no encontrado');
      error.status = 404;
      return next(error);
    }
    res.status(200).json(updatedProject); 
  } catch (error) {
    next(error);
  }
};

// Eliminar (Lógico) Proyecto
//  DELETE /api/projects/:id
exports.deleteProject = async (req, res, next) => {
  try {
    const deletedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!deletedProject) {
      const error = new Error('Proyecto no encontrado');
      error.status = 404;
      return next(error);
    }
    res.status(200).json({ mensaje: 'Proyecto eliminado lógicamente' });
  } catch (error) {
    next(error);
  }
};